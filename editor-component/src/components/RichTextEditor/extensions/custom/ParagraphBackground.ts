import { Extension } from '@tiptap/core';

export const ParagraphBackground = Extension.create({
  name: 'paragraphBackground',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.backgroundColor || null,
            renderHTML: (attrs) => {
              if (!attrs.backgroundColor) return {};
              return {
                style: `background-color: ${attrs.backgroundColor}; padding: 2px 6px; border-radius: 3px;`,
              };
            },
          },
        },
      },
    ];
  },
});