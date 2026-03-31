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
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import ResizableImage from './custom/ResizableImage/index';
import { Columns, Column } from './custom/Columns';
import { VideoEmbed } from './custom/VideoEmbed/index';
import { ParagraphBackground } from './custom/ParagraphBackground';

import { fileToBase64 } from '../../../utils/imageUtils';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const ImagePasteHandler = Extension.create({
  name: 'imagePasteHandler',

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        key: new PluginKey('imagePasteHandler'),
        props: {
          handlePaste(_view, event) {
            const files = Array.from(event.clipboardData?.files || [])
              .filter(f => ALLOWED_IMAGE_TYPES.includes(f.type));

            if (files.length === 0) return false;

            event.preventDefault();

            files.forEach(async (file) => {
              const base64 = await fileToBase64(file);
              editor.chain().insertContent({
                type: 'resizableImage',
                attrs: { src: base64, alt: file.name },
              }).run();
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
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Placeholder.configure({ placeholder: 'Kezdj el írni...' }),
  Link.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),

  GlobalDragHandle.configure({
    dragHandleWidth: 20,
    scrollTreshold: 100,
    excludedTags: ['table'],
  }),

  ResizableImage.configure({ inline: false, allowBase64: true }),

  Columns,
  Column,

  VideoEmbed,

  ParagraphBackground,

  ImagePasteHandler,

  FileHandler.configure({
    allowedMimeTypes: ALLOWED_IMAGE_TYPES,
    onDrop: async (editor, files, pos) => {
      for (const file of files) {
        const base64 = await fileToBase64(file);
        editor.chain().insertContentAt(pos, {
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