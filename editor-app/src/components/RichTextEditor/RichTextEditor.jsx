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

function getInitialContent(articleId) {
  try {
    const raw = localStorage.getItem(`rte_content_${articleId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return '<p>Kezdj el írni...</p>';
}

export default function RichTextEditor({ articleId }) {
  const importInputRef = useRef(null);

  const editor = useEditor({
    extensions,
    content: getInitialContent(articleId),
    onUpdate: ({ editor }) => scheduleSave(editor),
  });

  const { saveStatus, statusLabel, scheduleSave, saveNow, exportJSON, importJSON } = useAutoSave(editor, articleId);
  const { fileInputRef, addImageByUrl, addImageByFile, onFileChange, addVideo }    = useImageHandlers(editor);
  const { setLink }                                                                 = useEditorLink(editor);
  const { bgColor, handleBgColorChange }                                            = usePageBackground(articleId);

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