import { Box, Button, CircularProgress } from '@mui/material';
import SaveOutlinedIcon    from '@mui/icons-material/SaveOutlined';
import PublishIcon         from '@mui/icons-material/Publish';

interface ActionBarProps {
  onSaveDraft: () => void;
  onPublish:   () => void;
  loading?:    boolean;
  disabled?:   boolean;
}

export default function ActionBar({ onSaveDraft, onPublish, loading = false, disabled = false }: ActionBarProps) {
  return (
    <Box
      sx={{
        position:        'sticky',
        bottom:          16,
        display:         'flex',
        justifyContent:  'flex-end',
        gap:             1.5,
        px:              2,
        py:              1.5,
        bgcolor:         'background.paper',
        border:          '1px solid',
        borderColor:     'divider',
        borderRadius:    2,
        boxShadow:       3,
        zIndex:          10,
      }}
    >
      <Button
        variant="outlined"
        size="medium"
        startIcon={loading ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
        onClick={onSaveDraft}
        disabled={disabled || loading}
      >
        Mentés piszkozatként
      </Button>

      <Button
        variant="contained"
        size="medium"
        startIcon={<PublishIcon />}
        onClick={onPublish}
        disabled={disabled || loading}
      >
        Publikálás
      </Button>
    </Box>
  );
}
