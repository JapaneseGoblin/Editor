import { Extension } from '@tiptap/core';

// Bekezdés szintű háttérszín attribútum regisztrálása
export const ParagraphBackground = Extension.create({
  name: 'paragraphBackground',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (el) => el.style.backgroundColor || null,
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