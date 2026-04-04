import { useState, useCallback, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useResizable } from '../../../hooks/useResizable';
import { IconLayout, IconEdit } from './icons';
import LayoutPanel from '../../../components/LayoutPanel';
import ImageEditorModal from '../../../components/ImageEditorModal';

export default function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const {
    src, alt, width, align, float: floatVal,
    caption, borderRadius, borderWidth, borderColor,
  } = node.attrs as {
    src: string; alt: string; width: string; align: string; float: string;
    caption: string; borderRadius: string; borderWidth: string; borderColor: string;
  };

  const [showEditor, setShowEditor] = useState(false);
  const layoutBtnRef = useRef<HTMLButtonElement>(null);

  const { containerRef, onResizeStart, setLayout, isFloat, wrapperStyle, showPanel, setShowPanel } =
    useResizable({ width, floatVal, align, selected: selected ?? false, updateAttributes, minWidth: 100 });

  const handleEditorSave = useCallback((result: {
    src: string; alt: string; caption: string;
    borderRadius: string; borderWidth: string; borderColor: string;
  }) => {
    updateAttributes(result);
    setShowEditor(false);
  }, [updateAttributes]);

  const containerStyle = {
    position:     'relative' as const,
    display:      'inline-block',
    width:        isFloat ? '100%' : width,
    maxWidth:     '100%',
    borderRadius: borderRadius || '6px',
    overflow:     'hidden',
    border:       borderWidth && borderWidth !== '0px'
                    ? `${borderWidth} solid ${borderColor || '#000'}`
                    : 'none',
    boxSizing:    'border-box' as const,
  };

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <>
      <NodeViewWrapper style={wrapperStyle}>
        <div className={`rte-image-wrapper${selected ? ' rte-image-wrapper--selected' : ''}`}>
          <div ref={containerRef} className="rte-image-container" style={containerStyle}>
            <img
              src={src} alt={alt || ''}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              draggable={false}
            />

            <div className="rte-image-drag-handle" data-drag-handle title="Húzd át">
              <svg viewBox="0 0 10 10" fill="currentColor" width="12" height="12">
                <path d="M3,2 C2.45,2 2,1.55 2,1 C2,0.45 2.45,0 3,0 C3.55,0 4,0.45 4,1 C4,1.55 3.55,2 3,2 Z M3,6 C2.45,6 2,5.55 2,5 C2,4.45 2.45,4 3,4 C3.55,4 4,4.45 4,5 C4,5.55 3.55,6 3,6 Z M3,10 C2.45,10 2,9.55 2,9 C2,8.45 2.45,8 3,8 C3.55,8 4,8.45 4,9 C4,9.55 3.55,10 3,10 Z M7,2 C6.45,2 6,1.55 6,1 C6,0.45 6.45,0 7,0 C7.55,0 8,0.45 8,1 C8,1.55 7.55,2 7,2 Z M7,6 C6.45,6 6,5.55 6,5 C6,4.45 6.45,4 7,4 C7.55,4 8,4.45 8,5 C8,5.55 7.55,6 7,6 Z M7,10 C6.45,10 6,9.55 6,9 C6,8.45 6.45,8 7,8 C7.55,8 8,8.45 8,9 C8,9.55 7.55,10 7,10 Z" />
              </svg>
            </div>

            {selected && (
              <>
                <div className="rte-image-resize-handle" onMouseDown={onResizeStart} />
                <button className="rte-image-edit-btn" title="Képszerkesztő"
                  onMouseDown={(e) => { stop(e); setShowEditor(true); }}>
                  <IconEdit />
                </button>
                <button ref={layoutBtnRef} className="rte-image-layout-trigger" title="Elrendezés"
                  onMouseDown={(e) => { stop(e); setShowPanel((v: boolean) => !v); }}>
                  <IconLayout />
                </button>
              </>
            )}

            {showPanel && (
              <LayoutPanel
                floatVal={floatVal}
                align={align}
                onSetLayout={setLayout}
                onClose={() => setShowPanel(false)}
                triggerRef={layoutBtnRef}
              />
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