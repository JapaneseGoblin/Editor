import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';

import extensions from './extensions';
import { fileToBase64 } from '../../utils/imageUtils';
import Toolbar from './components/Toolbar';
import BubbleToolbar from './components/BubbleToolbar';
import './editor.css';

export default function RichTextEditor() {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions,
    content: '<p>Helló, ez egy Tiptap editor.</p>',
    onUpdate: ({ editor }) => {
      console.log('JSON:', editor.getJSON());
      console.log('HTML:', editor.getHTML());
    },
  });

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

  // Kép fájlból – megnyitja a file pickert
  const addImageByFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Fájl kiválasztása után base64-re konvertál
  const onFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const base64 = await fileToBase64(file);
    editor.chain().focus().insertContent({
      type: 'resizableImage',
      attrs: { src: base64, alt: file.name },
    }).run();
    e.target.value = ''; // reset hogy ugyanazt a fájlt újra lehessen választani
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

      {/* Rejtett file input a képfeltöltéshez */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </div>
  );
}