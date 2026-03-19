import Image from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import ImageEditorModal from '../../components/ImageEditorModal';

// ── Layout ikonok ──────────────────────────────────────────────
const IconBlockLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="10" y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="6" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockCenter = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="6" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="2" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="1" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="16" y="6" width="3" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconBlockRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="2" width="8" height="12" rx="1" fill="currentColor"/><rect x="0" y="2" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="6" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="9" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatLeft   = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="0" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="10" y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="10" y="4" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;
const IconFloatRight  = () => <svg width="20" height="16" viewBox="0 0 20 16"><rect x="12" y="0" width="8" height="8" rx="1" fill="currentColor"/><rect x="0" y="0" width="10" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="2" y="4" width="8" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="0" y="10" width="20" height="2" rx="1" fill="currentColor" opacity=".5"/><rect x="4" y="14" width="16" height="2" rx="1" fill="currentColor" opacity=".5"/></svg>;

const IconLayout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
    <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
  </svg>
);

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const LAYOUT_OPTIONS = [
  { float: 'none', align: 'left',   Icon: IconBlockLeft,   label: 'Bal' },
  { float: 'none', align: 'center', Icon: IconBlockCenter, label: 'Közép' },
  { float: 'none', align: 'right',  Icon: IconBlockRight,  label: 'Jobb' },
  { float: 'left',  align: 'left',  Icon: IconFloatLeft,   label: 'Bal (körbef.)' },
  { float: 'right', align: 'right', Icon: IconFloatRight,  label: 'Jobb (körbef.)' },
];

// ── NodeView ───────────────────────────────────────────────────
function ResizableImageView({ node, updateAttributes, selected }) {
  const {
    src, alt, width, align, float: floatVal,
    caption, borderRadius, borderWidth, borderColor,
  } = node.attrs;

  const startX      = useRef(0);
  const startWidth  = useRef(0);
  const containerRef = useRef(null);
  const [showPanel,  setShowPanel]  = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  // ── Átméretezés ──────────────────────────────────────────────
  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
    // Valódi px szélességet olvasunk – parseInt('100%') === 100 lenne
    startWidth.current = containerRef.current
      ? containerRef.current.offsetWidth
      : (parseInt(width) || 400);

    const onMouseMove = (e) => {
      const diff = e.clientX - startX.current;
      updateAttributes({ width: `${Math.max(100, startWidth.current + diff)}px` });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [width, updateAttributes]);

  // ── Elrendezés váltás ─────────────────────────────────────────
  const setLayout = useCallback((newFloat, newAlign) => {
    const updates = { float: newFloat, align: newAlign };

    if (newFloat !== 'none') {
      // Float módban a NodeViewWrapper explicit px szélességet kap
      // (különben a CSS [data-node-view-wrapper]{width:100%} felülírná).
      //
      // Ha width már px-ben van (pl. '300px') → KÖZVETLENÜL HASZNÁLJUK,
      // nem olvasunk DOM-ból (ez okozta a korábbi bugot).
      //
      // Ha width %-ban vagy más egységben van → DOM-ból olvassuk.
      if (width && width.endsWith('px')) {
        // Px értéket nem kell módosítani – a wrapperStyle.width = width
        // automatikusan a helyes méretet adja
      } else {
        // % → px konverzió
        const domPx = containerRef.current ? containerRef.current.offsetWidth : 0;
        updates.width = `${domPx > 0 ? domPx : 300}px`;
      }
    }

    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes]);

  // ── Képszerkesztő mentés ──────────────────────────────────────
  const handleEditorSave = useCallback((result) => {
    updateAttributes({
      src:          result.src,
      alt:          result.alt,
      caption:      result.caption,
      borderRadius: result.borderRadius,
      borderWidth:  result.borderWidth,
      borderColor:  result.borderColor,
    });
    setShowEditor(false);
  }, [updateAttributes]);

  // ── Stílusok ──────────────────────────────────────────────────
  const isFloat = floatVal && floatVal !== 'none';

  // Float módban a NodeViewWrapper-nek explicit px szélesség kell,
  // különben a [data-node-view-wrapper]{width:100%} CSS érvényesül
  const wrapperStyle = isFloat ? {
    float: floatVal,
    width,   // px értéket tartalmaz – korrektül override-olja a CSS-t
    margin: floatVal === 'left'
      ? '0.25rem 1.25rem 0.5rem 0'
      : '0.25rem 0 0.5rem 1.25rem',
    display: 'block',
  } : {};

  const innerStyle     = isFloat ? {} : { textAlign: align || 'left' };
  // Float módban a container 100% = a wrapper px szélessége
  const containerWidth = isFloat ? '100%' : width;

  const containerStyle = {
    position:     'relative',
    display:      'inline-block',
    width:        containerWidth,
    borderRadius: borderRadius || '6px',
    overflow:     'hidden',
    border:       borderWidth && borderWidth !== '0px'
                    ? `${borderWidth} solid ${borderColor || '#000'}`
                    : 'none',
    boxSizing:    'border-box',
  };

  return (
    <>
      <NodeViewWrapper style={wrapperStyle} data-drag-handle>
        <div
          className={`rte-image-wrapper${selected ? ' rte-image-wrapper--selected' : ''}`}
          style={innerStyle}
        >
          <div ref={containerRef} className="rte-image-container" style={containerStyle}>
            <img
              src={src}
              alt={alt || ''}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              draggable={false}
            />

            {selected && (
              <>
                <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />

                <button
                  className="rte-image-edit-btn"
                  title="Képszerkesztő"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowEditor(true); }}
                >
                  <IconEdit />
                </button>

                <button
                  className="rte-image-layout-trigger"
                  title="Elrendezés"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(v => !v); }}
                >
                  <IconLayout />
                </button>
              </>
            )}

            {showPanel && selected && (
              <div className="rte-layout-panel" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}>
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

          {caption && <div className="rte-image-caption">{caption}</div>}
        </div>
      </NodeViewWrapper>

      {showEditor && (
        <ImageEditorModal
          src={src}
          attrs={{ alt, caption, borderRadius, borderWidth, borderColor }}
          onSave={handleEditorSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
}

// ── Extension ─────────────────────────────────────────────────
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