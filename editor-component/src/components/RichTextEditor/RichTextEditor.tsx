import { useRef, useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { Box, CircularProgress, Typography } from '@mui/material';

import extensions from './extensions';

const _completeRef: { current: (ctx: string) => Promise<string> } = { current: () => Promise.resolve('') };
const _stableComplete = (ctx: string) => _completeRef.current(ctx);
import { createAIAutocompleteExtension } from './extensions/AIAutocomplete';
import { useAI }            from './hooks/useAI';
import Toolbar              from './components/Toolbar';
import BubbleToolbar        from './components/BubbleToolbar';
import { useAutoSave }      from './hooks/useAutoSave';
import { useImageHandlers } from './hooks/useImageHandlers';
import { useEditorLink }    from './hooks/useEditorLink';
import { usePageBackground } from './hooks/usePageBackground';
import { resolveMediaUrlsCached } from '../../utils/resolveMediaUrls';
import './styles/index.css';

interface RichTextEditorProps {
  articleId: string | number;
}

function getInitialContent(articleId: string | number): string | object {
  try {
    const raw = localStorage.getItem(`rte_content_${articleId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* fallback */ }
  return '<p>Kezdj el írni...</p>';
}

function hasAuthImages(content: string | object): boolean {
  return JSON.stringify(content).includes('/evoHumusz/Media/GetMedia');
}

export default function RichTextEditor({ articleId }: RichTextEditorProps) {
  const importInputRef  = useRef<HTMLInputElement>(null);
  const { complete }    = useAI();
  const scheduleSaveRef = useRef<((ed: Editor) => void) | null>(null);

  useEffect(() => { _completeRef.current = complete; }, [complete]);

  const allExtensions = useMemo(
    () => [...extensions, createAIAutocompleteExtension(_stableComplete)],
    []
  );

  const initialContent = useMemo(() => getInitialContent(articleId), [articleId]);
  const needsResolve   = useMemo(() => hasAuthImages(initialContent), [initialContent]);

  const editor = useEditor({
    extensions: allExtensions,
    content: initialContent,
    onUpdate: ({ editor: ed }: { editor: Editor }) => scheduleSaveRef.current?.(ed),
  });

  const { saveStatus, statusLabel, scheduleSave, saveNow, exportJSON, importJSON } = useAutoSave(editor, articleId);

  useEffect(() => { scheduleSaveRef.current = scheduleSave; });

  useEffect(() => {
    if (!editor || !needsResolve) return;
    let cancelled = false;
    resolveMediaUrlsCached(
      initialContent as Parameters<typeof resolveMediaUrlsCached>[0],
      String(articleId)
    ).then(resolved => {
      if (cancelled || editor.isDestroyed) return;
      editor.commands.setContent(resolved, { emitUpdate: false });
    });
    return () => { cancelled = true; };
  }, [editor, needsResolve, initialContent, articleId]);

  const { fileInputRef, addImageByUrl, addImageByFile, onFileChange, addVideo } = useImageHandlers(editor);
  const { setLink }                 = useEditorLink(editor);
  const { bgColor, handleBgColorChange } = usePageBackground(articleId);

  if (!editor) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">Editor betöltése...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      border: '1px solid', borderColor: 'divider',
      borderRadius: 2, overflow: 'hidden',
      bgcolor: 'background.paper', boxShadow: 1, height: '100%',
    }}>
      <Toolbar
        editor={editor}
        onSetLink={setLink}
        onAddImageByUrl={addImageByUrl}
        onAddImageByFile={addImageByFile}
        onAddVideo={addVideo}
        bgColor={bgColor}
        onBgColorChange={handleBgColorChange}
        onSaveNow={saveNow}
        onExportJSON={exportJSON}
        onImportJSON={() => importInputRef.current?.click()}
      />
      <BubbleToolbar editor={editor} onSetLink={setLink} />
      <Box className="rte-editor-surface" sx={{
        flex: 1, overflowY: 'auto',
        p: { xs: 1.5, sm: 2, md: 3 },
        bgcolor: bgColor,
        '& .ProseMirror': { outline: 'none', minHeight: 200 },
      }}>
        <EditorContent editor={editor} />
      </Box>
      <Box sx={{
        display: 'flex', alignItems: 'center',
        px: 2, py: 0.75,
        borderTop: '1px solid', borderColor: 'divider',
        bgcolor: 'grey.50',
      }}>
        <Box component="span" sx={{
          display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12,
          color: saveStatus === 'saved' ? 'success.main'
               : saveStatus === 'error' ? 'error.main'
               : 'text.disabled',
        }}>
          {saveStatus === 'saving' && <CircularProgress size={10} />}
          {statusLabel}
        </Box>
      </Box>
      <input ref={fileInputRef} type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }} onChange={onFileChange} />
      <input ref={importInputRef} type="file"
        accept=".json,application/json"
        style={{ display: 'none' }} onChange={importJSON} />
    </Box>
  );
}