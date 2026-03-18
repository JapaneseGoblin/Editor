import { Node, mergeAttributes } from '@tiptap/core';

// ── Column gyerek node ─────────────────────────────────────────
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

// ── Columns wrapper node ───────────────────────────────────────
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
        parseHTML: (el) => parseInt(el.getAttribute('data-columns')) || 2,
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
      // Kiválasztott szöveget/blokkot hasábba csomagol, vagy új üres hasábot szúr be
      insertColumns: (count = 2) => ({ chain, state }) => {
        const columns = Array.from({ length: count }, () => ({
          type: 'column',
          content: [{ type: 'paragraph' }],
        }));

        return chain()
          .insertContent({ type: 'columns', attrs: { count }, content: columns })
          .run();
      },

      // Meglévő columns node oszlopszámát változtatja
      setColumnsCount: (count) => ({ chain, state, tr }) => {
        const { selection } = state;
        let columnsPos = null;
        let columnsNode = null;

        // Megkeressük a legközelebbi columns ancestor-t
        state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
          if (node.type.name === 'columns') {
            const resolvedFrom = state.doc.resolve(selection.from);
            for (let d = resolvedFrom.depth; d >= 0; d--) {
              if (resolvedFrom.node(d) === node) {
                columnsPos = pos;
                columnsNode = node;
              }
            }
          }
        });

        if (!columnsNode) return false;

        const currentCount = columnsNode.childCount;

        if (count === currentCount) return false;

        if (count > currentCount) {
          // Új üres column-ok hozzáadása
          const newColumns = Array.from({ length: count - currentCount }, () =>
            state.schema.nodes.column.create(null, [
              state.schema.nodes.paragraph.create(),
            ])
          );
          let insertPos = columnsPos + columnsNode.nodeSize - 1;
          let t = tr.setNodeMarkup(columnsPos, undefined, { count });
          newColumns.forEach((col) => {
            t = t.insert(insertPos, col);
            insertPos += col.nodeSize;
          });
          return chain().command(({ tr: _tr, dispatch }) => {
            if (dispatch) dispatch(t);
            return true;
          }).run();
        } else {
          // Fölösleges column-ok eltávolítása (tartalom megmarad az elsőkben)
          let t = tr.setNodeMarkup(columnsPos, undefined, { count });
          let sizeSum = 0;
          columnsNode.forEach((col, offset, i) => {
            if (i < count) { sizeSum += col.nodeSize; }
          });
          const removeFrom = columnsPos + 1 + sizeSum;
          const removeTo = columnsPos + columnsNode.nodeSize - 1;
          if (removeFrom < removeTo) {
            t = t.delete(removeFrom, removeTo);
          }
          return chain().command(({ tr: _tr, dispatch }) => {
            if (dispatch) dispatch(t);
            return true;
          }).run();
        }
      },

      // Hasábok feloldása – tartalom visszakerül normál paragrafusokba
      removeColumns: () => ({ chain, state, tr }) => {
        const { selection } = state;
        let columnsPos = null;
        let columnsNode = null;

        state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
          if (node.type.name === 'columns') {
            const resolved = state.doc.resolve(selection.from);
            for (let d = resolved.depth; d >= 0; d--) {
              if (resolved.node(d) === node) {
                columnsPos = pos;
                columnsNode = node;
              }
            }
          }
        });

        if (!columnsNode) return false;

        // Gyűjtsük össze az összes gyerek tartalmát
        const content = [];
        columnsNode.forEach((col) => {
          col.forEach((child) => content.push(child));
        });

        let t = tr.replaceWith(
          columnsPos,
          columnsPos + columnsNode.nodeSize,
          content
        );

        return chain().command(({ dispatch }) => {
          if (dispatch) dispatch(t);
          return true;
        }).run();
      },
    };
  },
});