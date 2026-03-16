import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import extensions from './extensions';
import { fileToBase64 } from '../../utils/imageUtils';
import Toolbar from './components/Toolbar';
import BubbleToolbar from './components/BubbleToolbar';
import './editor.css';

const STORAGE_KEY = 'rte_content';

function formatTime(date) {
  return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function RichTextEditor() {
  const fileInputRef    = useRef(null);
  const importInputRef  = useRef(null);
  const saveTimerRef    = useRef(null);

  const [lastSaved,  setLastSaved]  = useState(null);   // Date | null
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  // localStorage-ból tölti be a kezdeti tartalmat
  const getInitialContent = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return '<p>Helló, ez egy Tiptap editor.</p>';
  };

  const editor = useEditor({
    extensions,
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      // Debounced auto-mentés 1 mp után
      clearTimeout(saveTimerRef.current);
      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(() => {
        autoSave(editor);
      }, 1000);
    },
  });

  // Cleanup timer
  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const autoSave = useCallback((ed) => {
    try {
      const json = ed.getJSON();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (_) {
      setSaveStatus('error');
    }
  }, []);

  // Manuális azonnali mentés
  const saveNow = useCallback(() => {
    if (!editor) return;
    clearTimeout(saveTimerRef.current);
    autoSave(editor);
  }, [editor, autoSave]);

  // JSON fájl letöltése
  const exportJSON = useCallback(() => {
    if (!editor) return;
    const json = editor.getJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dokumentum_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor]);

  // JSON fájl betöltése
  const importJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        editor.commands.setContent(json);
        setLastSaved(null);
        setSaveStatus('idle');
      } catch (_) {
        alert('Érvénytelen JSON fájl.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [editor]);

  // Link kezelés
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url  = window.prompt('Add meg a link URL-jét', prev);
    if (url === null) return;
    url.trim()
      ? editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      : editor.chain().focus().unsetLink().run();
  }, [editor]);

  // Kép URL-ből
  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Kép URL');
    if (url?.trim()) {
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: { src: url.trim(), alt: '' },
      }).run();
    }
  }, [editor]);

  // Kép fájlból
  const addImageByFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const base64 = await fileToBase64(file);
    editor.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: { src: base64, alt: file.name },
    }).run();
    e.target.value = '';
  }, [editor]);

  if (!editor) return <div>Editor betöltése...</div>;

  const statusLabel = saveStatus === 'saving' ? 'Mentés...'
    : saveStatus === 'error'  ? 'Mentési hiba!'
    : lastSaved               ? `Mentve: ${formatTime(lastSaved)}`
    : 'Nincs mentve';

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

      {/* Státuszsor */}
      <div className="rte-statusbar">
        <span className={`rte-statusbar__status rte-statusbar__status--${saveStatus}`}>
          {saveStatus === 'saving' && <span className="rte-statusbar__spinner" />}
          {statusLabel}
        </span>
        <div className="rte-statusbar__actions">
          <button className="rte-statusbar__btn" onClick={saveNow} title="Mentés most">
            💾 Mentés
          </button>
          <button className="rte-statusbar__btn" onClick={exportJSON} title="Letöltés JSON-ként">
            ⬇ Export
          </button>
          <button className="rte-statusbar__btn" onClick={() => importInputRef.current?.click()} title="JSON betöltése">
            ⬆ Import
          </button>
        </div>
      </div>

      {/* Rejtett inputok */}
      <input ref={fileInputRef}   type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: 'none' }} onChange={onFileChange} />
      <input ref={importInputRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={importJSON} />
    </div>
  );
}