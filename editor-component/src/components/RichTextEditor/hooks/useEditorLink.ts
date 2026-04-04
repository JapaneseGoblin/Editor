import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';

export function useEditorLink(editor: Editor | null) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = (editor.getAttributes('link').href as string) || '';
    const url  = window.prompt('Add meg a link URL-jét', prev);
    if (url === null) return;
    if (url.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  return { setLink };
}