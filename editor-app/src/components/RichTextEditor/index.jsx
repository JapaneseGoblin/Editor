import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import FileHandler from '@tiptap/extension-file-handler';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TextStyle, FontFamily, FontSize, Color } from '@tiptap/extension-text-style';
import ResizableImage from './custom/ResizableImage';

import { fileToBase64 } from '../../../utils/imageUtils';

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
  }),
  Underline,
  Subscript,
  Superscript,
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph', 'resizableImage'] }),
  Placeholder.configure({ placeholder: 'Kezdj el írni...' }),
  Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),

  // ResizableImage – saját custom node az alap Image helyett
  ResizableImage.configure({ inline: false, allowBase64: true }),

  // FileHandler – drag&drop és vágólapról beillesztés
  FileHandler.configure({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    onDrop: async (editor, files, pos) => {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        editor.chain().insertContentAt(pos, {
          type: 'resizableImage',
          attrs: { src: base64, alt: file.name },
        }).run();
      }
    },
    onPaste: async (editor, files) => {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        editor.chain().insertContent({
          type: 'resizableImage',
          attrs: { src: base64, alt: file.name },
        }).run();
      }
    },
  }),

  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

export default extensions;