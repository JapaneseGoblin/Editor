import { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  Box, Typography, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import extensions from '../../RichTextEditor/extensions';
import { resolveMediaUrlsCached } from '../../../utils/resolveMediaUrls';
import '../../RichTextEditor/styles/index.css';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  formDraftId: string;
  articleId?: string;
  title: string;
}

function getPreviewContent(formDraftId: string, articleId?: string): string | object {
  const formKey = `rte_content_form_${formDraftId}_cikk`;
  const seedKey = articleId ? `rte_content_${articleId}` : null;
  const raw = localStorage.getItem(formKey) ?? (seedKey ? localStorage.getItem(seedKey) : null);
  if (!raw) return '<p style="color:#999">A cikk szövege még üres.</p>';
  try { return JSON.parse(raw); } catch { return '<p>Nem sikerült betölteni.</p>'; }
}

function PreviewEditorInner({ content }: { content: string | object }) {
  const allExtensions = useMemo(() => extensions, []);

  const editor = useEditor({
    extensions: allExtensions,
    content,
    editable: false,
    immediatelyRender: false,
  });

  // Képek feloldása betöltés után
  useMemo(() => {
    if (!editor) return;
    const doc = editor.getJSON();
    const docStr = JSON.stringify(doc);
    if (!docStr.includes('/evoHumusz/Media/GetMedia')) return;
    resolveMediaUrlsCached(doc, `preview_editor_${JSON.stringify(content).slice(0, 40)}`).then(resolved => {
      if (!editor.isDestroyed) editor.commands.setContent(resolved, { emitUpdate: false });
    });
  }, [editor, content]);

  if (!editor) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">Betöltés...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 6 }, py: 4,
      '& .ProseMirror': { outline: 'none' },
    }}>
      <EditorContent editor={editor} />
    </Box>
  );
}

export default function PreviewDialog({ open, onClose, formDraftId, articleId, title }: PreviewDialogProps) {
  const content = useMemo(
    () => open ? getPreviewContent(formDraftId, articleId) : '',
    [open, formDraftId, articleId]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pr: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box>
          <Typography fontWeight={700} fontSize="1rem">Előnézet</Typography>
          {title && (
            <Typography variant="caption" color="text.secondary"
              sx={{ display: 'block', mt: 0.25, maxWidth: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {open && <PreviewEditorInner content={content} />}
      </DialogContent>
    </Dialog>
  );
}