import { useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import { uploadImageToEditor } from '../../../utils/imageUpload';

interface UseImageHandlersReturn {
  fileInputRef: RefObject<HTMLInputElement | null>;
  addImageByUrl: () => void;
  addImageByFile: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  addVideo: () => void;
}

export function useImageHandlers(editor: Editor | null): UseImageHandlersReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    await uploadImageToEditor(editor, file, (src) => {
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: { src, alt: file.name },
      }).run();
    });

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