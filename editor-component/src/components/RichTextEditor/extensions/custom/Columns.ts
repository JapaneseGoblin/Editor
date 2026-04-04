import { Node, mergeAttributes } from '@tiptap/core';
import type { RawCommands } from '@tiptap/core';
import type { Node as PmNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      insertColumns: (count?: number) => ReturnType;
      setColumnsCount: (count: number) => ReturnType;
      removeColumns: () => ReturnType;
    };
  }
}

export const Column = Node.create({
  name: 'column',
  group: 'column',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'rte-column' }), 0];
  },
});

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: (el) => parseInt((el as HTMLElement).getAttribute('data-columns') ?? '2') || 2,
        renderHTML: (attrs) => ({ 'data-columns': attrs.count }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: 'rte-columns' }), 0];
  },

  addCommands() {
    return {
      insertColumns: (count = 2) => ({ chain }: { chain: () => { insertContent: (c: unknown) => { run: () => boolean } } }) => {
        const columns = Array.from({ length: count }, () => ({
          type: 'column',
          content: [{ type: 'paragraph' }],
        }));
        return chain().insertContent({ type: 'columns', attrs: { count }, content: columns }).run();
      },

      setColumnsCount: (count: number) => ({ chain, state, tr }: { chain: () => { command: (fn: (args: { dispatch?: (tr: Transaction) => void }) => boolean) => { run: () => boolean } }, state: ReturnType<typeof import('@tiptap/pm/state').EditorState.create>, tr: Transaction }) => {
        const { selection } = state;
        let columnsPos: number | null = null;
        let columnsNode: PmNode | null = null;

        state.doc.nodesBetween(0, state.doc.content.size, (node: PmNode, pos: number) => {
          if (node.type.name === 'columns') {
            const resolvedFrom = state.doc.resolve(selection.from);
            for (let d = resolvedFrom.depth; d >= 0; d--) {
              if (resolvedFrom.node(d) === node) { columnsPos = pos; columnsNode = node; }
            }
          }
        });

        if (!columnsNode || columnsPos === null) return false;

        const currentCount = (columnsNode as PmNode).childCount;
        if (count === currentCount) return false;

        if (count > currentCount) {
          const newCols = Array.from({ length: count - currentCount }, () =>
            state.schema.nodes.column.create(null, [state.schema.nodes.paragraph.create()])
          );
          let insertPos = (columnsPos as number) + (columnsNode as PmNode).nodeSize - 1;
          let t = tr.setNodeMarkup(columnsPos as number, undefined, { count });
          newCols.forEach((col) => { t = t.insert(insertPos, col); insertPos += col.nodeSize; });
          return chain().command(({ dispatch }) => { dispatch?.(t); return true; }).run();
        } else {
          let t = tr.setNodeMarkup(columnsPos as number, undefined, { count });
          let sizeSum = 0;
          (columnsNode as PmNode).forEach((col: PmNode, _: number, i: number) => {
            if (i < count) sizeSum += col.nodeSize;
          });
          const removeFrom = (columnsPos as number) + 1 + sizeSum;
          const removeTo   = (columnsPos as number) + (columnsNode as PmNode).nodeSize - 1;
          if (removeFrom < removeTo) t = t.delete(removeFrom, removeTo);
          return chain().command(({ dispatch }) => { dispatch?.(t); return true; }).run();
        }
      },

      removeColumns: () => ({ chain, state, tr }: { chain: () => { command: (fn: (args: { dispatch?: (tr: Transaction) => void }) => boolean) => { run: () => boolean } }, state: ReturnType<typeof import('@tiptap/pm/state').EditorState.create>, tr: Transaction }) => {
        const { selection } = state;
        let columnsPos: number | null = null;
        let columnsNode: PmNode | null = null;

        state.doc.nodesBetween(0, state.doc.content.size, (node: PmNode, pos: number) => {
          if (node.type.name === 'columns') {
            const resolved = state.doc.resolve(selection.from);
            for (let d = resolved.depth; d >= 0; d--) {
              if (resolved.node(d) === node) { columnsPos = pos; columnsNode = node; }
            }
          }
        });

        if (!columnsNode || columnsPos === null) return false;

        const content: PmNode[] = [];
        (columnsNode as PmNode).forEach((col: PmNode) => {
          col.forEach((child: PmNode) => content.push(child));
        });

        const t = tr.replaceWith(columnsPos as number, (columnsPos as number) + (columnsNode as PmNode).nodeSize, content);
        return chain().command(({ dispatch }) => { dispatch?.(t); return true; }).run();
      },
    } as Partial<RawCommands>;
  },
});