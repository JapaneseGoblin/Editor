import type { Editor } from '@tiptap/core';
import { uploadMedia } from './apiClient';

export async function uploadImageToEditor(
  editor: Editor,
  file: File,
  insertFn: (src: string) => void,
): Promise<void> {
  const tempUrl = URL.createObjectURL(file);
  insertFn(tempUrl);

  try {
    const { url } = await uploadMedia(file);

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'resizableImage' && node.attrs.src === tempUrl) {
        editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes('resizableImage', { src: url })
          .run();
        URL.revokeObjectURL(tempUrl);
        return false;
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'AUTH_REQUIRED') {
      alert('A token lejárt vagy érvénytelen. Állítsd be újra a lakat ikonnal.');
    } else if (msg.startsWith('NETWORK_ERROR')) {
      alert('Nem sikerült elérni a szervert.');
      console.error('Hálózati hiba:', msg);
    } else {
      console.error('Képfeltöltés hiba:', err);
    }
  }
}