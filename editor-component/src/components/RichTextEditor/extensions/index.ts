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
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import ResizableImage from './custom/ResizableImage/index';
import { Columns, Column } from './custom/Columns';
import { VideoEmbed } from './custom/VideoEmbed/index';
import { ParagraphBackground } from './custom/ParagraphBackground';
import { uploadImageToEditor } from '../../../utils/imageUpload';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// ── Paste handler ─────────────────────────────────────────────
const ImagePasteHandler = Extension.create({
  name: 'imagePasteHandler',

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('imagePasteHandler'),
        props: {
          handlePaste(_view, event) {
            const files = Array.from(event.clipboardData?.files ?? [])
              .filter((f) => ALLOWED_IMAGE_TYPES.includes(f.type));

            if (files.length === 0) return false;
            event.preventDefault();

            files.forEach((file) => {
              uploadImageToEditor(editor, file, (src) => {
                editor.chain().insertContent({
                  type: 'resizableImage',
                  attrs: { src, alt: file.name },
                }).run();
              });
            });

            return true;
          },
        },
      }),
    ];
  },
});

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    dropcursor: { color: '#7c3aed', width: 2 },
  }),
  Underline,
  Subscript,
  Superscript,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Placeholder.configure({ placeholder: 'Kezdj el írni...' }),
  Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
  TextStyle,
  FontFamily,
  FontSize,
  Color,
  ResizableImage,
  GlobalDragHandle,
  Columns,
  Column,
  VideoEmbed,
  ParagraphBackground,
  ImagePasteHandler,

  // ── Drag & drop ──────────────────────────────────────────────
  FileHandler.configure({
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    onDrop: async (editor, files, pos) => {
      for (const file of files) {
        await uploadImageToEditor(editor, file, (src) => {
          editor.chain().insertContentAt(pos, {
            type: 'resizableImage',
            attrs: { src, alt: file.name },
          }).run();
        });
      }
    },
  }),

  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

export default extensions;