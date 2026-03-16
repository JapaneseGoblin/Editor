import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import { BUBBLE_ITEMS } from '../config/toolbar';
import ToolbarButton from './ToolbarButton';

export default function BubbleToolbar({ editor, onSetLink }) {
  const activeStates = useEditorState({
    editor,
    selector: (ctx) => ({
      bold:      ctx.editor.isActive('bold'),
      italic:    ctx.editor.isActive('italic'),
      underline: ctx.editor.isActive('underline'),
      strike:    ctx.editor.isActive('strike'),
      link:      ctx.editor.isActive('link'),
    }),
  });

  if (!editor) return null;

  return (
    <BubbleMenu editor={editor}>
      <div className="rte-bubble-menu">
        {BUBBLE_ITEMS.map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            tooltip={item.tooltip}
            active={activeStates[item.id] ?? false}
            onClick={() => {
              if (item.id === 'link') {
                onSetLink?.();
              } else {
                item.action(editor);
              }
            }}
          />
        ))}
      </div>
    </BubbleMenu>
  );
}