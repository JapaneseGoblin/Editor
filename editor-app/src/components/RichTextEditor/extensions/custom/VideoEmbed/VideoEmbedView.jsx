import React, { useState, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { IconLayout } from '../ResizableImage/icons';
import { useResizable } from '../../../hooks/useResizable';
import LayoutPanel from '../../../components/LayoutPanel';

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function VideoEmbedView({ node, updateAttributes, selected, deleteNode }) {
  const { src, width, align, float: floatVal } = node.attrs;

  const [editing,   setEditing] = useState(!src);
  const [input,     setInput]   = useState(src || '');

  const { containerRef, onResizeStart, setLayout, isFloat, wrapperStyle, showPanel, setShowPanel } =
    useResizable({ width, floatVal, align, selected, updateAttributes, minWidth: 200, fallbackWidth: 400 });

  const handleSave = useCallback(() => {
    const url = input.trim();
    if (!url) return;
    updateAttributes({ src: url });
    setEditing(false);
  }, [input, updateAttributes]);

  const stop      = (e) => { e.preventDefault(); e.stopPropagation(); };
  const embedUrl  = getEmbedUrl(src);

  return (
    <NodeViewWrapper style={wrapperStyle} data-drag-handle>
      <div className={`rte-video-wrapper${selected ? ' rte-video-wrapper--selected' : ''}`}>
        <div
          ref={containerRef}
          className="rte-video-container"
          style={{ display: 'inline-block', width: isFloat ? '100%' : width, position: 'relative', maxWidth: '100%' }}
        >
          {editing || !src ? (
            <div className="rte-video-input-box">
              <div className="rte-video-input-box__title">🎬 Videó beillesztése</div>
              <input
                className="rte-video-input-box__input"
                placeholder="YouTube / Vimeo URL vagy MP4 link..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <div className="rte-video-input-box__actions">
                <button className="rte-video-input-box__btn rte-video-input-box__btn--primary" onClick={handleSave}>Beillesztés</button>
                {src && <button className="rte-video-input-box__btn" onClick={() => setEditing(false)}>Mégse</button>}
                <button className="rte-video-input-box__btn rte-video-input-box__btn--danger" onClick={deleteNode}>Törlés</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ borderRadius: 8, outline: selected ? '2px solid #3b82f6' : 'none', position: 'relative', overflow: 'hidden' }}>
                {isDirectVideo(src) ? (
                  <video src={src} controls style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={embedUrl}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Videó"
                    />
                    {selected && <div style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'default' }} />}
                  </div>
                )}
              </div>

              {selected && (
                <>
                  <div className="rte-image-resize-handle" onMouseDown={onResizeStart}
                    style={{ position: 'absolute', bottom: 4, right: 4, zIndex: 20 }} />
                  <button className="rte-image-layout-trigger" title="Elrendezés" onMouseDown={(e) => { stop(e); setShowPanel(v => !v); }}>
                    <IconLayout />
                  </button>
                  <button className="rte-image-edit-btn" title="URL szerkesztése" onMouseDown={(e) => { stop(e); setInput(src); setEditing(true); }}>
                    ✏️
                  </button>
                </>
              )}

              {showPanel && selected && (
                <LayoutPanel
                  floatVal={floatVal}
                  align={align}
                  onSetLayout={setLayout}
                  onClose={() => setShowPanel(false)}
                />
              )}
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}