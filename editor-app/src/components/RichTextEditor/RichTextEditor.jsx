import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import extensions from './extensions';
import Toolbar from './components/Toolbar';
import BubbleToolbar from './components/BubbleToolbar';
import { useAutoSave }       from './hooks/useAutoSave';
import { useImageHandlers }  from './hooks/useImageHandlers';
import { useEditorLink }     from './hooks/useEditorLink';
import { usePageBackground } from './hooks/usePageBackground';
import './styles/index.css';

const STORAGE_KEY = 'rte_content';

function getInitialContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return '<p>Helló, ez egy Tiptap editor.</p>';
}

export default function RichTextEditor() {
  const importInputRef = useRef(null);

  const editor = useEditor({
    extensions,
    content: getInitialContent(),
    onUpdate: ({ editor }) => scheduleSave(editor),
  });

  const { saveStatus, statusLabel, scheduleSave, saveNow, exportJSON, importJSON } = useAutoSave(editor);
  const { fileInputRef, addImageByUrl, addImageByFile, onFileChange, addVideo }    = useImageHandlers(editor);
  const { setLink }                                                                 = useEditorLink(editor);
  const { bgColor, handleBgColorChange }                                            = usePageBackground();

  if (!editor) return <div>Editor betöltése...</div>;

  return (
    <div className="rte-wrapper">
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

      <div className="rte-editor-surface" style={{ background: bgColor }}>
        <EditorContent editor={editor} />
      </div>

      <div className="rte-statusbar">
        <span className={`rte-statusbar__status rte-statusbar__status--${saveStatus}`}>
          {saveStatus === 'saving' && <span className="rte-statusbar__spinner" />}
          {statusLabel}
        </span>
      </div>

      <input ref={fileInputRef}   type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={onFileChange} />
      <input ref={importInputRef} type="file" accept=".json,application/json"                    style={{ display: 'none' }} onChange={importJSON} />
    </div>
  );
}