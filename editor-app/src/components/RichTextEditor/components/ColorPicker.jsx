import React, { useState, useRef, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rte_saved_colors';
const MAX_SAVED = 16;

const BASE_COLORS = [
  '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#ffffff',
  '#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff',
  '#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#cfe2f3','#d9d2e9','#ead1dc',
  '#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#b4a7d6','#d5a6bd',
  '#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc','#8e7cc3','#c27ba0',
  '#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3d85c6','#674ea7','#a61c00',
];

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveSaved(colors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

// hex → {r,g,b}
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r, g, b };
}
// {r,g,b} → hex
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Number(v)||0)).toString(16).padStart(2,'0')).join('');
}

export default function ColorPicker({ onSelect, onClear, label, title, currentColor }) {
  const [open,  setOpen]  = useState(false);
  const [saved, setSaved] = useState(loadSaved);
  const [rgb,   setRgb]   = useState({ r:0, g:0, b:0 });
  const ref     = useRef(null);
  const wrapRef = useRef(null);

  const [panelStyle, setPanelStyle] = useState({});

  useEffect(() => {
    if (!open) return;
    if (wrapRef.current) {
      const rect  = wrapRef.current.getBoundingClientRect();
      const panelW = 220;
      const viewW  = window.innerWidth;
      const left   = rect.left + panelW > viewW - 8
        ? rect.right - panelW
        : rect.left;
      setPanelStyle({
        position: 'fixed',
        top:  rect.bottom + 6,
        left: Math.max(8, left),
        width: panelW,
      });
    }
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);

  const handleSelect = useCallback((hex) => {
    onSelect(hex);
    setOpen(false);
  }, [onSelect]);

  const handleClear = useCallback(() => {
    onClear?.();
    setOpen(false);
  }, [onClear]);

  const handleSwatchClick = (hex) => {
    const { r,g,b } = hexToRgb(hex);
    setRgb({r,g,b});
    handleSelect(hex);
  };

  const handleRgbChange = (channel, val) => {
    setRgb(prev => ({ ...prev, [channel]: val }));
  };

  const handleSave = () => {
    if (!hexColor) return;
    setSaved(prev => {
      const next = [hexColor, ...prev.filter(c => c !== hexColor)].slice(0, MAX_SAVED);
      saveSaved(next);
      return next;
    });
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        className="rte-colorpicker-trigger"
        title={title}
        onClick={() => setOpen(v => !v)}
      >
        <span className="rte-colorpicker-trigger__label">{label}</span>
        <span
          className="rte-colorpicker-trigger__swatch"
          style={{ background: currentColor || 'transparent' }}
        />
      </button>

      {open && (
        <div
          ref={ref}
          className="rte-colorpicker-panel"
          style={panelStyle}
        >
          {/* Alap színek */}
          <div className="rte-colorpicker__section-label">Színek</div>
          <div className="rte-colorpicker__grid">
            {BASE_COLORS.map(c => (
              <button
                key={c}
                className={`rte-colorpicker__swatch${currentColor === c ? ' active' : ''}`}
                style={{ background: c }}
                title={c}
                onClick={() => handleSwatchClick(c)}
              />
            ))}
          </div>

          {/* Mentett színek */}
          {saved.length > 0 && (
            <>
              <div className="rte-colorpicker__section-header">
                <span className="rte-colorpicker__section-label" style={{ margin: 0 }}>Mentett</span>
                <button
                  className="rte-colorpicker__clear-saved"
                  title="Mentett színek törlése"
                  onClick={() => { setSaved([]); saveSaved([]); }}
                >Törlés</button>
              </div>
              <div className="rte-colorpicker__grid">
                {saved.map((c, i) => (
                  <button
                    key={i}
                    className={`rte-colorpicker__swatch${currentColor === c ? ' active' : ''}`}
                    style={{ background: c }}
                    title={c}
                    onClick={() => handleSwatchClick(c)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="rte-colorpicker__divider" />

          {/* RGB input + preview */}
          <div className="rte-colorpicker__rgb-row">
            <div
              className="rte-colorpicker__rgb-preview"
              style={{ background: hexColor }}
              title="Kattints az alkalmazáshoz"
              onClick={() => handleSelect(hexColor)}
            />
            {['r','g','b'].map(ch => (
              <div key={ch} className="rte-colorpicker__rgb-field">
                <input
                  type="number"
                  min="0" max="255"
                  className="rte-colorpicker__rgb-input"
                  value={rgb[ch]}
                  onChange={(e) => handleRgbChange(ch, e.target.value)}
                  onBlur={(e) => handleRgbChange(ch, Math.max(0, Math.min(255, Number(e.target.value)||0)))}
                />
                <span className="rte-colorpicker__rgb-label">{ch.toUpperCase()}</span>
              </div>
            ))}
            <button
              className="rte-colorpicker__save-btn"
              title="Mentés a listába"
              onClick={handleSave}
            >+</button>
          </div>

          {/* Nincs szín */}
          {onClear && (
            <button className="rte-colorpicker__no-color" onClick={handleClear}>
              <span className="rte-colorpicker__no-color-swatch" />
              Nincs szín
            </button>
          )}
        </div>
      )}
    </div>
  );
}