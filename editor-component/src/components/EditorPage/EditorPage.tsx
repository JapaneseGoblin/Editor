import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

export default function EditorPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
    }}>
      {/* Fejléc */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/article/${id}`)}
        >
          Vissza a cikkhez
        </Button>
      </Box>

      {/* Editor – tölti a maradék helyet */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: { xs: 1, sm: 2 }, maxWidth: 1400, width: '100%', mx: 'auto', alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
        <RichTextEditor articleId={id ?? '1'} />
      </Box>
    </Box>
  );
}