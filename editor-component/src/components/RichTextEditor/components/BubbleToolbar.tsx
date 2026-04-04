import { BubbleMenu } from '@tiptap/react/menus';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { Paper, Box, Divider } from '@mui/material';
import { BUBBLE_ITEMS } from '../config/toolbar';
import ToolbarButton from './ToolbarButton';
import AIRewritePanel from './AIRewritePanel';

interface BubbleToolbarProps {
  editor: Editor;
  onSetLink: () => void;
}

export default function BubbleToolbar({ editor, onSetLink }: BubbleToolbarProps) {
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

  return (
    <BubbleMenu editor={editor}>
      <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', gap: 0.25, p: 0.5, borderRadius: 1.5 }}>
        {BUBBLE_ITEMS.map((item) => (
          <ToolbarButton
            key={item.id}
            icon={item.icon}
            tooltip={item.tooltip}
            active={activeStates[item.id as keyof typeof activeStates] ?? false}
            onClick={() => {
              if (item.id === 'link') onSetLink();
              else item.action?.(editor);
            }}
          />
        ))}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AIRewritePanel editor={editor} />
        </Box>
      </Paper>
    </BubbleMenu>
  );
}