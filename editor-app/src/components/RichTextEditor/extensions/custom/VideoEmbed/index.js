import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VideoEmbedView from './VideoEmbedView';

export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src:   { default: '' },
      width: { default: '100%' },
      align: { default: 'left' },
      float: { default: 'none' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'video-embed' })];
  },

  addCommands() {
    return {
      insertVideo: (attrs = {}) => ({ commands }) => {
        return commands.insertContent({ type: 'videoEmbed', attrs });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },
});