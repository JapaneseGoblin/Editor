import { Box } from '@mui/material';
import type { Editor } from '@tiptap/react';
import type { ToolbarGroup as ToolbarGroupType } from '../config/toolbar';
import ToolbarButton from './ToolbarButton';

interface ToolbarGroupProps {
  group: ToolbarGroupType;
  editor: Editor;
  onLinkClick?: () => void;
}

export default function ToolbarGroup({ group, editor, onLinkClick }: ToolbarGroupProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {group.items.map((item) => (
        <ToolbarButton
          key={item.id}
          icon={item.icon}
          tooltip={item.tooltip}
          active={item.isActive(editor)}
          onClick={() => {
            if (item.id === 'link') onLinkClick?.();
            else item.action?.(editor);
          }}
        />
      ))}
    </Box>
  );
}