import React from 'react';
import { LAYOUT_OPTIONS } from '../extensions/custom/ResizableImage/icons';

/**
 * Közös elrendezés panel kép és videó NodeView-okhoz.
 */
export default function LayoutPanel({ floatVal, align, onSetLayout, onClose }) {
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div className="rte-layout-panel" onMouseDown={stop}>
      <div className="rte-layout-panel__header">
        <span>Elrendezés</span>
        <button className="rte-layout-panel__close" onMouseDown={(e) => { stop(e); onClose(); }}>✕</button>
      </div>

      <div className="rte-layout-panel__section-label">Sortöréssel</div>
      <div className="rte-layout-panel__row">
        {LAYOUT_OPTIONS.filter(o => o.float === 'none').map(opt => (
          <button
            key={opt.align}
            className={`rte-layout-option${floatVal === opt.float && align === opt.align ? ' active' : ''}`}
            title={opt.label}
            onMouseDown={(e) => { stop(e); onSetLayout(opt.float, opt.align); }}
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
            onMouseDown={(e) => { stop(e); onSetLayout(opt.float, opt.align); }}
          >
            <opt.Icon />
          </button>
        ))}
      </div>
    </div>
  );
}