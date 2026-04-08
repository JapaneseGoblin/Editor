import { Box, Typography } from '@mui/material';
import RichTextEditor from '../../RichTextEditor/RichTextEditor';

interface RichEditorFieldProps {
  label:      string;
  editorId:   string | number;
  minHeight?: number;
}

export default function RichEditorField({ label, editorId, minHeight = 220 }: RichEditorFieldProps) {
  return (
    <Box>
      <Typography
        variant="body2"
        fontWeight={500}
        color="text.secondary"
        sx={{ mb: 0.75 }}
      >
        {label}
      </Typography>

      <Box sx={{ height: minHeight }}>
        <RichTextEditor articleId={editorId} />
      </Box>
    </Box>
  );
}
