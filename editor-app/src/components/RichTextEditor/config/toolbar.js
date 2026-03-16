import {
  Bold, Italic, Underline, Strikethrough,
  Superscript, Subscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered,
  Heading1, Heading2, Heading3,
  Quote, Code2, Minus, Table, Link,
  Undo2, Redo2, Highlighter, Eraser,
} from 'lucide-react';

export const FONT_FAMILIES = [
  { label: 'Alapértelmezett', value: '' },
  { label: 'Arial',           value: 'Arial' },
  { label: 'Georgia',         value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Verdana',         value: 'Verdana' },
  { label: 'Courier New',     value: 'Courier New' },
];

export const FONT_SIZES = [
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '24', value: '24px' },
  { label: '32', value: '32px' },
  { label: '48', value: '48px' },
];

export const TOOLBAR_GROUPS = [
  {
    id: 'history',
    items: [
      { id: 'undo', icon: Undo2, tooltip: 'Visszavonás', action: (e) => e.chain().focus().undo().run(), isActive: () => false },
      { id: 'redo', icon: Redo2, tooltip: 'Újra',        action: (e) => e.chain().focus().redo().run(), isActive: () => false },
    ],
  },
  {
    id: 'format',
    items: [
      { id: 'bold',        icon: Bold,        tooltip: 'Félkövér',        action: (e) => e.chain().focus().toggleBold().run(),        isActive: (e) => e.isActive('bold') },
      { id: 'italic',      icon: Italic,      tooltip: 'Dőlt',            action: (e) => e.chain().focus().toggleItalic().run(),      isActive: (e) => e.isActive('italic') },
      { id: 'underline',   icon: Underline,   tooltip: 'Aláhúzott',       action: (e) => e.chain().focus().toggleUnderline().run(),   isActive: (e) => e.isActive('underline') },
      { id: 'strike',      icon: Strikethrough, tooltip: 'Áthúzott',      action: (e) => e.chain().focus().toggleStrike().run(),      isActive: (e) => e.isActive('strike') },
      { id: 'superscript', icon: Superscript, tooltip: 'Felső index',     action: (e) => e.chain().focus().toggleSuperscript().run(), isActive: (e) => e.isActive('superscript') },
      { id: 'subscript',   icon: Subscript,   tooltip: 'Alsó index',      action: (e) => e.chain().focus().toggleSubscript().run(),   isActive: (e) => e.isActive('subscript') },
      { id: 'highlight',   icon: Highlighter, tooltip: 'Kiemelés',        action: (e) => e.chain().focus().toggleHighlight().run(),   isActive: (e) => e.isActive('highlight') },
      { id: 'clear',       icon: Eraser,      tooltip: 'Formázás törlése',action: (e) => e.chain().focus().unsetAllMarks().clearNodes().run(), isActive: () => false },
    ],
  },
  {
    id: 'heading',
    items: [
      { id: 'h1', icon: Heading1, tooltip: 'Címsor 1', action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (e) => e.isActive('heading', { level: 1 }) },
      { id: 'h2', icon: Heading2, tooltip: 'Címsor 2', action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (e) => e.isActive('heading', { level: 2 }) },
      { id: 'h3', icon: Heading3, tooltip: 'Címsor 3', action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (e) => e.isActive('heading', { level: 3 }) },
    ],
  },
  {
    id: 'align',
    items: [
      { id: 'alignLeft',    icon: AlignLeft,    tooltip: 'Balra',     action: (e) => e.isActive('resizableImage') ? e.chain().focus().updateAttributes('resizableImage', { align: 'left' }).run()    : e.chain().focus().setTextAlign('left').run(),    isActive: (e) => e.isActive({ textAlign: 'left' })    || (e.isActive('resizableImage') && e.getAttributes('resizableImage').align === 'left') },
      { id: 'alignCenter',  icon: AlignCenter,  tooltip: 'Középre',   action: (e) => e.isActive('resizableImage') ? e.chain().focus().updateAttributes('resizableImage', { align: 'center' }).run()  : e.chain().focus().setTextAlign('center').run(),  isActive: (e) => e.isActive({ textAlign: 'center' })  || (e.isActive('resizableImage') && e.getAttributes('resizableImage').align === 'center') },
      { id: 'alignRight',   icon: AlignRight,   tooltip: 'Jobbra',    action: (e) => e.isActive('resizableImage') ? e.chain().focus().updateAttributes('resizableImage', { align: 'right' }).run()   : e.chain().focus().setTextAlign('right').run(),   isActive: (e) => e.isActive({ textAlign: 'right' })   || (e.isActive('resizableImage') && e.getAttributes('resizableImage').align === 'right') },
      { id: 'alignJustify', icon: AlignJustify, tooltip: 'Sorkizárt', action: (e) => e.chain().focus().setTextAlign('justify').run(), isActive: (e) => e.isActive({ textAlign: 'justify' }) },
    ],
  },
  {
    id: 'list',
    items: [
      { id: 'bulletList',  icon: List,        tooltip: 'Felsorolás',      action: (e) => e.chain().focus().toggleBulletList().run(),  isActive: (e) => e.isActive('bulletList') },
      { id: 'orderedList', icon: ListOrdered, tooltip: 'Számozott lista', action: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive('orderedList') },
    ],
  },
  {
    id: 'insert',
    items: [
      { id: 'blockquote',     icon: Quote, tooltip: 'Idézet',           action: (e) => e.chain().focus().toggleBlockquote().run(),                                      isActive: (e) => e.isActive('blockquote') },
      { id: 'codeBlock',      icon: Code2, tooltip: 'Kód blokk',        action: (e) => e.chain().focus().toggleCodeBlock().run(),                                       isActive: (e) => e.isActive('codeBlock') },
      { id: 'horizontalRule', icon: Minus, tooltip: 'Vízszintes vonal', action: (e) => e.chain().focus().setHorizontalRule().run(),                                     isActive: () => false },
      { id: 'table',          icon: Table, tooltip: 'Táblázat',         action: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),  isActive: (e) => e.isActive('table') },
    ],
  },
];

export const BUBBLE_ITEMS = [
  { id: 'bold',      icon: Bold,          tooltip: 'Félkövér',  action: (e) => e.chain().focus().toggleBold().run(),      isActive: (e) => e.isActive('bold') },
  { id: 'italic',    icon: Italic,        tooltip: 'Dőlt',      action: (e) => e.chain().focus().toggleItalic().run(),    isActive: (e) => e.isActive('italic') },
  { id: 'underline', icon: Underline,     tooltip: 'Aláhúzott', action: (e) => e.chain().focus().toggleUnderline().run(), isActive: (e) => e.isActive('underline') },
  { id: 'strike',    icon: Strikethrough, tooltip: 'Áthúzott',  action: (e) => e.chain().focus().toggleStrike().run(),    isActive: (e) => e.isActive('strike') },
  { id: 'link',      icon: Link,          tooltip: 'Link',      action: null,                                             isActive: (e) => e.isActive('link') },
];