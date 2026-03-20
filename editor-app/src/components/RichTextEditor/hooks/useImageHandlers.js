import { useCallback, useRef } from 'react';
import { fileToBase64 } from '../../../utils/imageUtils';

export function useImageHandlers(editor) {
  const fileInputRef = useRef(null);

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

  const addVideo = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertContent({
      type: 'videoEmbed',
      attrs: { src: '' },
    }).run();
  }, [editor]);

  return { fileInputRef, addImageByUrl, addImageByFile, onFileChange, addVideo };
}