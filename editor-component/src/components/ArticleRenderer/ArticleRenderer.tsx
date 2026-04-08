import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateHTML } from '@tiptap/html';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
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
import { resolveMediaUrlsCached } from '../../utils/resolveMediaUrls';

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

  const [html, setHtml]       = useState<string>(() => {
    const raw = localStorage.getItem(`rte_content_${id}`);
    if (!raw) return '<p>Ehhez a cikkhez még nincs tartalom. Kattints a Szerkesztés gombra!</p>';
    try { JSON.parse(raw); } catch { return '<p>Nem sikerült betölteni a tartalmat.</p>'; }
    return '';
  });
  const [loading, setLoading] = useState(() => {
    const raw = localStorage.getItem(`rte_content_${id}`);
    if (!raw) return false;
    try { JSON.parse(raw); return true; } catch { return false; }
  });

  useEffect(() => {
    if (!loading) return;
    let cancelled = false;

    const raw = localStorage.getItem(`rte_content_${id}`);
    const doc = JSON.parse(raw!);

    resolveMediaUrlsCached(doc, `renderer_${id}`).then(resolved => {
      if (cancelled) return;
      setHtml(generateHTML(resolved, renderExtensions));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id, loading]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0, display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Vissza
        </Button>
        <Button variant="contained" size="small" startIcon={<EditIcon />} onClick={() => navigate(`/article/${id}/edit`)}>
          Szerkesztés
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Tartalom betöltése...</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: bgColor }}>
          <Box
            className="ProseMirror"
            sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Box>
      )}
    </Box>
  );
}