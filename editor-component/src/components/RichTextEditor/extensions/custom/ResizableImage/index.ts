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
        parseHTML: (el) => {
          const wrapper = el.closest('[data-rte-image-wrapper]') as HTMLElement | null;
          return wrapper?.style.width || (el as HTMLElement).style.width || el.getAttribute('width') || '100%';
        },
        renderHTML: () => ({}), 
      },
      align: {
        default: 'left',
        parseHTML: (el) => {
          const wrapper = el.closest('[data-rte-image-wrapper]') as HTMLElement | null;
          return wrapper?.getAttribute('data-align') || el.getAttribute('data-align') || 'left';
        },
        renderHTML: () => ({}),
      },
      float: {
        default: 'none',
        parseHTML: (el) => {
          const wrapper = el.closest('[data-rte-image-wrapper]') as HTMLElement | null;
          return wrapper?.getAttribute('data-float') || el.getAttribute('data-float') || 'none';
        },
        renderHTML: () => ({}),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-caption') || '',
        renderHTML: () => ({}),
      },
      borderRadius: {
        default: '6px',
        parseHTML: (el) => el.getAttribute('data-border-radius') || '6px',
        renderHTML: () => ({}),
      },
      borderWidth: {
        default: '0px',
        parseHTML: (el) => el.getAttribute('data-border-width') || '0px',
        renderHTML: () => ({}),
      },
      borderColor: {
        default: '#000000',
        parseHTML: (el) => el.getAttribute('data-border-color') || '#000000',
        renderHTML: () => ({}),
      },
    };
  },

  renderHTML({ node }) {
    const { src, alt, width, align, float: floatVal,
            borderRadius, borderWidth, borderColor, caption } = node.attrs as Record<string, string>;

    const isFloat = floatVal && floatVal !== 'none';

    const wrapperStyle = isFloat
      ? `float: ${floatVal}; width: ${width}; margin: ${floatVal === 'left' ? '0.25rem 1.25rem 0.5rem 0' : '0.25rem 0 0.5rem 1.25rem'}; display: block;`
      : `display: block; width: fit-content; max-width: 100%; margin-left: ${align === 'right' || align === 'center' ? 'auto' : '0'}; margin-right: ${align === 'center' ? 'auto' : '0'};`;

    const containerStyle = [
      `width: ${isFloat ? '100%' : width}`,
      `max-width: 100%`,
      `display: inline-block`,
      borderRadius ? `border-radius: ${borderRadius}` : '',
      borderWidth && borderWidth !== '0px' ? `border: ${borderWidth} solid ${borderColor || '#000'}` : '',
      `overflow: hidden`,
      `box-sizing: border-box`,
    ].filter(Boolean).join('; ');

    return [
      'div',
      { style: wrapperStyle, 'data-rte-image-wrapper': '', 'data-align': align, 'data-float': floatVal },
      ['div', { style: containerStyle },
        ['img', { src, alt: alt || '', style: 'width: 100%; height: auto; display: block;' }]],
      ...(caption ? [['div', { class: 'rte-image-caption' }, caption]] : []),
    ] as [string, Record<string, string>, ...unknown[]];
  },

  parseHTML() {
    return [
      { tag: 'div[data-rte-image-wrapper] img' },
      { tag: 'img[src]' },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;