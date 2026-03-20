import React, { useState, useRef, useCallback, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { IconLayout, LAYOUT_OPTIONS } from '../ResizableImage/icons';

// ── Segédfüggvények ───────────────────────────────────────────
function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return url;
  return null;
}

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function VideoEmbedView({ node, updateAttributes, selected, deleteNode }) {
  const { src, width, align, float: floatVal } = node.attrs;

  const startX       = useRef(0);
  const startWidth   = useRef(0);
  const containerRef = useRef(null);
  const [editing,   setEditing]   = useState(!src);
  const [input,     setInput]     = useState(src || '');
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  const handleSave = () => {
    const url = input.trim();
    if (!url) return;
    updateAttributes({ src: url });
    setEditing(false);
  };

  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    startWidth.current = containerRef.current
      ? containerRef.current.offsetWidth
      : (parseInt(width) || 400);

    const onMouseMove = (e) => {
      const diff = e.clientX - startX.current;
      updateAttributes({ width: `${Math.max(200, startWidth.current + diff)}px` });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [width, updateAttributes]);

  const setLayout = useCallback((newFloat, newAlign) => {
    const updates = { float: newFloat, align: newAlign };
    if (newFloat !== 'none' && (!width || !width.endsWith('px'))) {
      const domPx = containerRef.current ? containerRef.current.offsetWidth : 0;
      updates.width = `${domPx > 0 ? domPx : 400}px`;
    }
    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes]);

  const isFloat        = floatVal && floatVal !== 'none';
  const wrapperStyle   = isFloat ? {
    float:   floatVal,
    width,
    margin:  floatVal === 'left' ? '0 1.25rem 0.5rem 0' : '0 0 0.5rem 1.25rem',
    display: 'block',
  } : {};
  const innerStyle     = isFloat ? {} : { textAlign: align || 'left' };
  const containerWidth = isFloat ? '100%' : width;
  const embedUrl       = getEmbedUrl(src);

  return (
    <NodeViewWrapper style={wrapperStyle} data-drag-handle>
      <div className={`rte-video-wrapper${selected ? ' rte-video-wrapper--selected' : ''}`} style={innerStyle}>
        <div ref={containerRef} className="rte-video-container"
          style={{ display: 'inline-block', width: containerWidth, position: 'relative', maxWidth: '100%' }}>

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
              <div style={{ borderRadius: 8, overflow: 'hidden', outline: selected ? '2px solid #3b82f6' : 'none', position: 'relative' }}>
                {isDirectVideo(src) ? (
                  <video src={src} controls style={{ width: '100%', display: 'block' }} />
                ) : (
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                    <iframe
                      src={embedUrl}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen title="Videó"
                    />
                    {selected && <div style={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'default' }} />}
                  </div>
                )}
              </div>

              {selected && (
                <>
                  <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />
                  <button className="rte-image-layout-trigger" title="Elrendezés"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(v => !v); }}>
                    <IconLayout />
                  </button>
                  <button className="rte-image-edit-btn" title="URL szerkesztése"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setInput(src); setEditing(true); }}>
                    ✏️
                  </button>
                </>
              )}

              {showPanel && selected && (
                <div className="rte-layout-panel" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <div className="rte-layout-panel__header">
                    <span>Elrendezés</span>
                    <button className="rte-layout-panel__close"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(false); }}>✕</button>
                  </div>
                  <div className="rte-layout-panel__section-label">Sortöréssel</div>
                  <div className="rte-layout-panel__row">
                    {LAYOUT_OPTIONS.filter(o => o.float === 'none').map(opt => (
                      <button key={opt.align}
                        className={`rte-layout-option${floatVal === opt.float && align === opt.align ? ' active' : ''}`}
                        title={opt.label}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setLayout(opt.float, opt.align); }}>
                        <opt.Icon />
                      </button>
                    ))}
                  </div>
                  <div className="rte-layout-panel__section-label">Szöveg körbefolyása</div>
                  <div className="rte-layout-panel__row">
                    {LAYOUT_OPTIONS.filter(o => o.float !== 'none').map(opt => (
                      <button key={opt.float}
                        className={`rte-layout-option${floatVal === opt.float ? ' active' : ''}`}
                        title={opt.label}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setLayout(opt.float, opt.align); }}>
                        <opt.Icon />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}