import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import extensions from './extensions';
import { fileToBase64 } from '../../utils/imageUtils';
import Toolbar from './components/Toolbar';
import BubbleToolbar from './components/BubbleToolbar';
import './styles/index.css';

const STORAGE_KEY = 'rte_content';
const BG_KEY      = 'rte_bgcolor';

function getInitialContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return '<p>Helló, ez egy Tiptap editor.</p>';
}

function formatTime(date) {
  return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function RichTextEditor() {
  const fileInputRef   = useRef(null);
  const importInputRef = useRef(null);
  const saveTimerRef   = useRef(null);

  const [lastSaved,  setLastSaved]  = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [bgColor,    setBgColor]    = useState(() => localStorage.getItem(BG_KEY) || '#ffffff');

  const editor = useEditor({
    extensions,
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      clearTimeout(saveTimerRef.current);
      setSaveStatus('saving');
      saveTimerRef.current = setTimeout(() => autoSave(editor), 1000);
    },
  });

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const autoSave = useCallback((ed) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ed.getJSON()));
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (_) {
      setSaveStatus('error');
    }
  }, []);

  const saveNow = useCallback(() => {
    if (!editor) return;
    clearTimeout(saveTimerRef.current);
    autoSave(editor);
  }, [editor, autoSave]);

  const exportJSON = useCallback(() => {
    if (!editor) return;
    const blob = new Blob([JSON.stringify(editor.getJSON(), null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `dokumentum_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor]);

  const importJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        editor.commands.setContent(JSON.parse(evt.target.result));
        setLastSaved(null);
        setSaveStatus('idle');
      } catch (_) {
        alert('Érvénytelen JSON fájl.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url  = window.prompt('Add meg a link URL-jét', prev);
    if (url === null) return;
    url.trim()
      ? editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      : editor.chain().focus().unsetLink().run();
  }, [editor]);

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

  const addImageByFile = useCallback(() => fileInputRef.current?.click(), []);

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

  // Videó beillesztése – üres node-ot szúr be, a NodeView maga kéri az URL-t
  const addVideo = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: 'videoEmbed', attrs: { src: '' } }).run();
  }, [editor]);

  // Háttérszín mentése
  const handleBgColorChange = useCallback((color) => {
    setBgColor(color);
    localStorage.setItem(BG_KEY, color);
  }, []);

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