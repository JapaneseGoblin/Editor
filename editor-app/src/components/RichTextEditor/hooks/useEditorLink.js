import { useCallback } from 'react';

export function useEditorLink(editor) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url  = window.prompt('Add meg a link URL-jét', prev);
    if (url === null) return;
    url.trim()
      ? editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      : editor.chain().focus().unsetLink().run();
  }, [editor]);

  return { setLink };
}