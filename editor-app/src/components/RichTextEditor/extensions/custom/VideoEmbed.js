import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useCallback, useEffect } from 'react';

// ── Layout ikonok (ugyanazok mint a képnél) ───────────────────
const IconBlockLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="10" y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="6" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockCenter = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="6" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0" y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="6" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="10" y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="4" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="0" y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="2" y="4" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="4" y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconLayout = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>;

const LAYOUT_OPTIONS = [
  { float: 'none', align: 'left',   Icon: IconBlockLeft,   label: 'Bal' },
  { float: 'none', align: 'center', Icon: IconBlockCenter, label: 'Közép' },
  { float: 'none', align: 'right',  Icon: IconBlockRight,  label: 'Jobb' },
  { float: 'left',  align: 'left',  Icon: IconFloatLeft,   label: 'Bal (körbef.)' },
  { float: 'right', align: 'right', Icon: IconFloatRight,  label: 'Jobb (körbef.)' },
];

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

// ── NodeView ──────────────────────────────────────────────────
function VideoEmbedView({ node, updateAttributes, selected, deleteNode }) {
  const { src, width, align, float: floatVal } = node.attrs;

  const startX      = useRef(0);
  const startWidth  = useRef(0);
  const containerRef = useRef(null);
  const [editing,    setEditing]   = useState(!src);
  const [input,      setInput]     = useState(src || '');
  const [showPanel,  setShowPanel] = useState(false);

  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  const handleSave = () => {
    const url = input.trim();
    if (!url) return;
    updateAttributes({ src: url });
    setEditing(false);
  };

  // ── Átméretezés ──────────────────────────────────────────────
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

  // ── Elrendezés ────────────────────────────────────────────────
  const setLayout = useCallback((newFloat, newAlign) => {
    const updates = { float: newFloat, align: newAlign };
    if (newFloat !== 'none' && (!width || !width.endsWith('px'))) {
      const domPx = containerRef.current ? containerRef.current.offsetWidth : 0;
      updates.width = `${domPx > 0 ? domPx : 400}px`;
    }
    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes]);

  const isFloat = floatVal && floatVal !== 'none';

  const wrapperStyle = isFloat ? {
    float: floatVal,
    width,
    margin: floatVal === 'left' ? '0 1.25rem 0.5rem 0' : '0 0 0.5rem 1.25rem',
    display: 'block',
  } : {};

  const innerStyle     = isFloat ? {} : { textAlign: align || 'left' };
  const containerWidth = isFloat ? '100%' : width;

  const embedUrl = getEmbedUrl(src);

  return (
    <NodeViewWrapper style={wrapperStyle} data-drag-handle>
      <div
        className={`rte-video-wrapper${selected ? ' rte-video-wrapper--selected' : ''}`}
        style={innerStyle}
      >
        <div
          ref={containerRef}
          className="rte-video-container"
          style={{ display: 'inline-block', width: containerWidth, position: 'relative', maxWidth: '100%' }}
        >
          {/* ── Input mód ── */}
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
            /* ── Videó mód ── */
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
                      allowFullScreen
                      title="Videó"
                    />
                    {/* Overlay: kijelölt állapotban blokkolja az iframe egéreseményeit,
                        így a resize handle és a gombok elérhetők */}
                    {selected && (
                      <div style={{
                        position: 'absolute', inset: 0, zIndex: 5, cursor: 'default',
                      }} />
                    )}
                  </div>
                )}
              </div>

              {/* Kijelölt állapot: resize + layout + szerkesztés gombok */}
              {selected && (
                <>
                  <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />

                  <button
                    className="rte-image-layout-trigger"
                    title="Elrendezés"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(v => !v); }}
                  >
                    <IconLayout />
                  </button>

                  <button
                    className="rte-image-edit-btn"
                    title="URL szerkesztése"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setInput(src); setEditing(true); }}
                  >
                    ✏️
                  </button>
                </>
              )}

              {/* Elrendezés panel */}
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

// ── Extension ─────────────────────────────────────────────────
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