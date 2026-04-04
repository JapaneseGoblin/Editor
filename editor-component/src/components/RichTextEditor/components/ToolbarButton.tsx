import type { ElementType } from 'react';
import { Tooltip, IconButton } from '@mui/material';

interface ToolbarButtonProps {
  icon: ElementType<{ size?: number }>;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

export default function ToolbarButton({ icon: Icon, tooltip, onClick, active = false, disabled = false }: ToolbarButtonProps) {
  return (
    <Tooltip title={tooltip} placement="top" arrow>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: 1,
            p: 0.5,
            color: active ? 'primary.main' : 'text.secondary',
            bgcolor: active ? 'primary.lighter' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Icon size={16} />
        </IconButton>
      </span>
    </Tooltip>
  );
}