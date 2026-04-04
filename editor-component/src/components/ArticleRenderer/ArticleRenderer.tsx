import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TextStyle, FontFamily, FontSize, Color } from '@tiptap/extension-text-style';
import ResizableImage from '../RichTextEditor/extensions/custom/ResizableImage/index';
import { Columns, Column } from '../RichTextEditor/extensions/custom/Columns';
import { VideoEmbed } from '../RichTextEditor/extensions/custom/VideoEmbed/index';
import { ParagraphBackground } from '../RichTextEditor/extensions/custom/ParagraphBackground';

import '../RichTextEditor/styles/index.css';

const renderExtensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false }),
  Underline, Subscript, Superscript,
  TextStyle, FontFamily, FontSize, Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Link.configure({ openOnClick: true, autolink: true, defaultProtocol: 'https' }),
  ResizableImage.configure({ inline: false, allowBase64: true }),
  Columns, Column, VideoEmbed, ParagraphBackground,
  Table.configure({ resizable: false }), TableRow, TableHeader, TableCell,
];

export default function ArticleRenderer() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const bgColor = localStorage.getItem(`rte_bgcolor_${id}`) || '#ffffff';

  const html = useMemo(() => {
    try {
      const raw = localStorage.getItem(`rte_content_${id}`);
      if (!raw) return '<p>Ehhez a cikkhez még nincs tartalom. Kattints a Szerkesztés gombra!</p>';
      return generateHTML(JSON.parse(raw), renderExtensions);
    } catch {
      return '<p>Nem sikerült betölteni a tartalmat.</p>';
    }
  }, [id]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>

      {/* Fejléc – ugyanolyan mint az EditorPage-en */}
      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Vissza
        </Button>
        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/article/${id}/edit`)}>
          Szerkesztés
        </Button>
      </Box>

      {/* Tartalom – ugyanolyan széles mint az editor */}
      <Box sx={{ flex: 1, p: { xs: 1, sm: 2 }, maxWidth: 1400, width: '100%', mx: 'auto', alignSelf: 'stretch' }}>
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            className="ProseMirror"
            sx={{
              p: { xs: 2, sm: 3 },
              bgcolor: bgColor,
              '& img': { pointerEvents: 'none' },
              '& [data-float="left"]':  { float: 'left',  margin: '0.25rem 1.25rem 0.5rem 0', display: 'block' },
              '& [data-float="right"]': { float: 'right', margin: '0.25rem 0 0.5rem 1.25rem', display: 'block' },
              '&::after': { content: '""', display: 'table', clear: 'both' },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Paper>
      </Box>
    </Box>
  );
}