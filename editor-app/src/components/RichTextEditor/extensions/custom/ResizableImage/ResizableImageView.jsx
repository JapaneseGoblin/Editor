import React, { useRef, useCallback, useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import ImageEditorModal from '../../../components/ImageEditorModal';
import { IconLayout, IconEdit, LAYOUT_OPTIONS } from './icons';

export default function ResizableImageView({ node, updateAttributes, selected }) {
  const {
    src, alt, width, align, float: floatVal,
    caption, borderRadius, borderWidth, borderColor,
  } = node.attrs;

  const startX       = useRef(0);
  const startWidth   = useRef(0);
  const containerRef = useRef(null);
  const [showPanel,  setShowPanel]  = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    startX.current = e.clientX;
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

  const setLayout = useCallback((newFloat, newAlign) => {
    const updates = { float: newFloat, align: newAlign };
    if (newFloat !== 'none' && (!width || !width.endsWith('px'))) {
      const domPx = containerRef.current ? containerRef.current.offsetWidth : 0;
      updates.width = `${domPx > 0 ? domPx : 300}px`;
    }
    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes]);

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

  const isFloat        = floatVal && floatVal !== 'none';
  const wrapperStyle   = isFloat ? {
    float:   floatVal,
    width,
    margin:  floatVal === 'left' ? '0.25rem 1.25rem 0.5rem 0' : '0.25rem 0 0.5rem 1.25rem',
    display: 'block',
  } : {};
  const innerStyle     = isFloat ? {} : { textAlign: align || 'left' };
  const containerStyle = {
    position:     'relative',
    display:      'inline-block',
    width:        isFloat ? '100%' : width,
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
            <img src={src} alt={alt || ''} style={{ width: '100%', height: 'auto', display: 'block' }} draggable={false} />

            {selected && (
              <>
                <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />
                <button className="rte-image-edit-btn" title="Képszerkesztő"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowEditor(true); }}>
                  <IconEdit />
                </button>
                <button className="rte-image-layout-trigger" title="Elrendezés"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowPanel(v => !v); }}>
                  <IconLayout />
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