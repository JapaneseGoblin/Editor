import Image from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React, { useRef, useCallback, useState, useEffect } from 'react';

// ── Layout opciók ──────────────────────────────────────────────
// Kis SVG ikonok a panel gombokhoz
const IconBlockLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="10" y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="6" width="8"  height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockCenter = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="6" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0"  y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0"  y="6" width="8"  height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0"  y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="10" y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="4" width="8"  height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0"  y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0"  y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="0"  y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="2"  y="4" width="8"  height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0"  y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="4"  y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;

// ── Elrendezés trigger ikon ────────────────────────────────────
const IconLayout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
    <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
  </svg>
);

const LAYOUT_OPTIONS = [
  { float: 'none', align: 'left',   Icon: IconBlockLeft,   label: 'Bal' },
  { float: 'none', align: 'center', Icon: IconBlockCenter, label: 'Közép' },
  { float: 'none', align: 'right',  Icon: IconBlockRight,  label: 'Jobb' },
  { float: 'left',  align: 'left',  Icon: IconFloatLeft,   label: 'Bal (körbef.)' },
  { float: 'right', align: 'right', Icon: IconFloatRight,  label: 'Jobb (körbef.)' },
];

// ── NodeView komponens ─────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }) {
  const { src, alt, width, align, float: floatVal } = node.attrs;
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [showPanel, setShowPanel] = useState(false);

  // Panel zárása, ha a kijelölés megszűnik
  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = parseInt(width) || 400;

    const onMouseMove = (e) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      updateAttributes({ width: `${newWidth}px` });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [width, updateAttributes]);

  const setLayout = useCallback((newFloat, newAlign) => {
    updateAttributes({ float: newFloat, align: newAlign });
    setShowPanel(false);
  }, [updateAttributes]);

  const isFloat = floatVal && floatVal !== 'none';

  // NodeViewWrapper stílus: float esetén maga a wrapper úszik
  const wrapperStyle = isFloat ? {
    float: floatVal,
    width,
    margin: floatVal === 'left'
      ? '0.25rem 1.25rem 0.5rem 0'
      : '0.25rem 0 0.5rem 1.25rem',
    display: 'block',
  } : {};

  // Belső wrapper stílus: csak block módban igazít
  const innerStyle = isFloat ? {} : { textAlign: align || 'left' };

  // Container szélessége: float módban 100% (wrapper tartja a méretet)
  const containerWidth = isFloat ? '100%' : width;

  return (
    <NodeViewWrapper style={wrapperStyle} data-drag-handle>
      <div
        className={`rte-image-wrapper${selected ? ' rte-image-wrapper--selected' : ''}`}
        style={innerStyle}
      >
        <div
          className="rte-image-container"
          style={{ position: 'relative', display: 'inline-block', width: containerWidth }}
        >
          <img
            src={src}
            alt={alt || ''}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }}
            draggable={false}
          />

          {selected && (
            <>
              {/* Átméretező fogantyú */}
              <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />

              {/* Elrendezés trigger gomb */}
              <button
                className="rte-image-layout-trigger"
                title="Elrendezés"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(v => !v); }}
              >
                <IconLayout />
              </button>
            </>
          )}

          {/* Elrendezés panel */}
          {showPanel && selected && (
            <div
              className="rte-layout-panel"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="rte-layout-panel__header">
                <span>Elrendezés</span>
                <button
                  className="rte-layout-panel__close"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(false); }}
                >✕</button>
              </div>

              <div className="rte-layout-panel__section-label">Sortöréssel</div>
              <div className="rte-layout-panel__row">
                {LAYOUT_OPTIONS.filter(o => o.float === 'none').map(opt => (
                  <button
                    key={opt.align}
                    className={`rte-layout-option${floatVal === opt.float && align === opt.align ? ' active' : ''}`}
                    title={opt.label}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setLayout(opt.float, opt.align); }}
                  >
                    <opt.Icon />
                  </button>
                ))}
              </div>

              <div className="rte-layout-panel__section-label">Szöveg körbefolyása</div>
              <div className="rte-layout-panel__row">
                {LAYOUT_OPTIONS.filter(o => o.float !== 'none').map(opt => (
                  <button
                    key={opt.float}
                    className={`rte-layout-option${floatVal === opt.float ? ' active' : ''}`}
                    title={opt.label}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setLayout(opt.float, opt.align); }}
                  >
                    <opt.Icon />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

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
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;