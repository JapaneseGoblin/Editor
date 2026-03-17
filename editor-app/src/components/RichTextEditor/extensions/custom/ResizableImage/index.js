import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageView from './ResizableImageView';

const ResizableImage = Image.extend({
  name: 'resizableImage',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (el) => el.style.width || el.getAttribute('width') || '100%',
        renderHTML: (attrs) => ({ style: `width: ${attrs.width}` }),
      },
      align: {
        default: 'left',
        parseHTML: (el) => el.getAttribute('data-align') || 'left',
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
      float: {
        default: 'none',
        parseHTML: (el) => el.getAttribute('data-float') || 'none',
        renderHTML: (attrs) => ({ 'data-float': attrs.float }),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-caption') || '',
        renderHTML: (attrs) => attrs.caption ? { 'data-caption': attrs.caption } : {},
      },
      borderRadius: {
        default: '6px',
        parseHTML: (el) => el.getAttribute('data-border-radius') || '6px',
        renderHTML: (attrs) => ({ 'data-border-radius': attrs.borderRadius }),
      },
      borderWidth: {
        default: '0px',
        parseHTML: (el) => el.getAttribute('data-border-width') || '0px',
        renderHTML: (attrs) => ({ 'data-border-width': attrs.borderWidth }),
      },
      borderColor: {
        default: '#000000',
        parseHTML: (el) => el.getAttribute('data-border-color') || '#000000',
        renderHTML: (attrs) => ({ 'data-border-color': attrs.borderColor }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;