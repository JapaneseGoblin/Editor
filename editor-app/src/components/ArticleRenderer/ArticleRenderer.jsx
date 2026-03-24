import React, { useMemo } from 'react';
import { generateHTML } from '@tiptap/html';

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TextStyle, FontFamily, FontSize, Color } from '@tiptap/extension-text-style';
import ResizableImage from '../RichTextEditor/extensions/custom/ResizableImage/index';
import { Columns, Column } from '../RichTextEditor/extensions/custom/Columns';
import { VideoEmbed } from '../RichTextEditor/extensions/custom/VideoEmbed/index';
import { ParagraphBackground } from '../RichTextEditor/extensions/custom/ParagraphBackground';

import '../RichTextEditor/styles/index.css';
import './article-renderer.css';

const STORAGE_KEY = 'rte_content';

const renderExtensions = [
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
  Link.configure({ openOnClick: true, autolink: true, defaultProtocol: 'https' }),
  ResizableImage.configure({ inline: false, allowBase64: true }),
  Columns,
  Column,
  VideoEmbed,
  ParagraphBackground,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];

export default function ArticleRenderer({ onEdit }) {
  const bgColor = localStorage.getItem('rte_bgcolor') || '#ffffff';

  const html = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return '<p>Nincs tartalom.</p>';
      const json = JSON.parse(raw);
      return generateHTML(json, renderExtensions);
    } catch (_) {
      return '<p>Nem sikerült betölteni a tartalmat.</p>';
    }
  }, []);

  return (
    <div className="article-renderer">
      <button className="article-renderer__edit-btn" onClick={onEdit}>
        ✏️ Szerkesztés
      </button>

      <div
        className="ProseMirror article-renderer__content"
        style={{ background: bgColor }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}