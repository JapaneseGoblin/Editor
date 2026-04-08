import { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  Box, Typography, CircularProgress, Chip, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import extensions from '../../RichTextEditor/extensions';
import { resolveMediaUrlsCached } from '../../../utils/resolveMediaUrls';
import { ROVAT_LABELS } from '../types';
import type { Rovat } from '../types';
import '../../RichTextEditor/styles/index.css';

interface PreviewMeta {
  cim:        string;
  szerzo?:    string;
  rovat?:     Rovat;
  tematika?:  string[];
  celcsoport?: string;
  mufaj?:     string;
  forras?:    string;
  date?:      string;
}

interface PreviewDialogProps {
  open:        boolean;
  onClose:     () => void;
  formDraftId: string;
  articleId?:  string;
  meta:        PreviewMeta;
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

  useMemo(() => {
    if (!editor) return;
    const doc = editor.getJSON();
    if (!JSON.stringify(doc).includes('/evoHumusz/Media/GetMedia')) return;
    resolveMediaUrlsCached(doc, `preview_${JSON.stringify(content).slice(0, 40)}`).then(resolved => {
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
    <Box sx={{ '& .ProseMirror': { outline: 'none' } }}>
      <EditorContent editor={editor} />
    </Box>
  );
}

export default function PreviewDialog({ open, onClose, formDraftId, articleId, meta }: PreviewDialogProps) {
  const content = useMemo(
    () => open ? getPreviewContent(formDraftId, articleId) : '',
    [open, formDraftId, articleId]
  );

  const rovatLabel = meta.rovat
    ? (ROVAT_LABELS[meta.rovat as keyof typeof ROVAT_LABELS] ?? meta.rovat)
    : null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen
      PaperProps={{ sx: { borderRadius: 0 } }}
    >
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        pr: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box>
          <Typography fontWeight={700} fontSize="1rem">Előnézet</Typography>
          {meta.cim && (
            <Typography variant="caption" color="text.secondary"
              sx={{ display: 'block', mt: 0.25, maxWidth: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {meta.cim}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {open && (
          <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 6 }, py: 4 }}>

            {/* Fejléc metaadatok */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                {rovatLabel && (
                  <Chip label={rovatLabel} size="small" color="primary" variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                )}
                {meta.mufaj && meta.mufaj !== '– Nincs –' && (
                  <Chip label={meta.mufaj} size="small" variant="outlined"
                    sx={{ fontSize: '0.72rem' }} />
                )}
              </Box>

              {/* Cím */}
              {meta.cim && (
                <Typography variant="h3" fontWeight={800}
                  sx={{ lineHeight: 1.2, letterSpacing: '-0.02em', mb: 1.5 }}>
                  {meta.cim}
                </Typography>
              )}

              {/* Szerző + dátum sor */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                {meta.szerzo && (
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {meta.szerzo}
                  </Typography>
                )}
                <Typography variant="body2" color="text.disabled">
                  {new Date().toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>

              {/* Tematika */}
              {meta.tematika && meta.tematika.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
                  {meta.tematika.map(t => (
                    <Chip key={t} label={t} size="small"
                      sx={{ bgcolor: 'action.hover', fontSize: '0.7rem', height: 22 }} />
                  ))}
                </Box>
              )}

              {/* Célcsoport + forrás */}
              {(meta.celcsoport || meta.forras) && (
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {meta.celcsoport && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Célcsoport:</strong> {meta.celcsoport}
                    </Typography>
                  )}
                  {meta.forras && (
                    <Typography variant="caption" color="text.secondary">
                      <strong>Forrás:</strong> {meta.forras}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Cikk szövege */}
            <PreviewEditorInner content={content} />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}