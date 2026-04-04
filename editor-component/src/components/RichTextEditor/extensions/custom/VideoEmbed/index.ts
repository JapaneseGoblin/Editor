import { Node, mergeAttributes } from '@tiptap/core';
import type { CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import VideoEmbedView from './VideoEmbedView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      insertVideo: (attrs?: Record<string, unknown>) => ReturnType;
    };
  }
}

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
      insertVideo: (attrs: Record<string, unknown> = {}) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ type: 'videoEmbed', attrs }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },
});