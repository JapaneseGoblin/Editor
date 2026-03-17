import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import extensions from './extensions';
import Toolbar from './components/Toolbar';
import BubbleToolbar from './components/BubbleToolbar';
import { useAutoSave } from './hooks/useAutoSave';
import { useImageHandlers } from './hooks/useImageHandlers';
import './editor.css';

const STORAGE_KEY = 'rte_content';

function getInitialContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return '<p>Helló, ez egy Tiptap editor.</p>';
}

export default function RichTextEditor() {
  const importInputRef  = useRef(null);
  // Ref-en keresztül adjuk át a scheduleSave-t az onUpdate-nek,
  // így nem lesz tyúk-tojás probléma (useEditor előbb fut mint useAutoSave)
  const scheduleSaveRef = useRef(null);

  const editor = useEditor({
    extensions,
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      scheduleSaveRef.current?.(editor);
    },
  });

  const { saveStatus, statusLabel, scheduleSave, saveNow, exportJSON, importJSON } = useAutoSave(editor);
  const { fileInputRef, addImageByUrl, addImageByFile, onFileChange } = useImageHandlers(editor);

  // Frissítjük a ref-et minden render után
  scheduleSaveRef.current = scheduleSave;

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url  = window.prompt('Add meg a link URL-jét', prev);
    if (url === null) return;
    url.trim()
      ? editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      : editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) return <div>Editor betöltése...</div>;

  return (
    <div className="rte-wrapper">
      <Toolbar
        editor={editor}
        onSetLink={setLink}
        onAddImageByUrl={addImageByUrl}
        onAddImageByFile={addImageByFile}
      />
      <BubbleToolbar editor={editor} onSetLink={setLink} />

      <div className="rte-editor-surface">
        <EditorContent editor={editor} />
      </div>

      <div className="rte-statusbar">
        <span className={`rte-statusbar__status rte-statusbar__status--${saveStatus}`}>
          {saveStatus === 'saving' && <span className="rte-statusbar__spinner" />}
          {statusLabel}
        </span>
        <div className="rte-statusbar__actions">
          <button className="rte-statusbar__btn" onClick={saveNow}>💾 Mentés</button>
          <button className="rte-statusbar__btn" onClick={exportJSON}>⬇ Export</button>
          <button className="rte-statusbar__btn" onClick={() => importInputRef.current?.click()}>⬆ Import</button>
        </div>
      </div>

      <input ref={fileInputRef}   type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={onFileChange} />
      <input ref={importInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={(e) => importJSON(e)} />
    </div>
  );
}