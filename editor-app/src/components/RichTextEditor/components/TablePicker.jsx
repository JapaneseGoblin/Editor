import React, { useState, useRef, useEffect, useCallback } from 'react';

const COLS = 8;
const ROWS = 8;

export default function TablePicker({ onInsert }) {
  const [open,    setOpen]    = useState(false);
  const [hoverC,  setHoverC]  = useState(0);
  const [hoverR,  setHoverR]  = useState(0);
  const ref = useRef(null);

  // Kattintás kívülre → zár
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleInsert = useCallback((rows, cols) => {
    onInsert(rows, cols);
    setOpen(false);
    setHoverR(0);
    setHoverC(0);
  }, [onInsert]);

  return (
    <div ref={ref} className="rte-table-picker-wrap">
      <button
        className={`rte-toolbar-btn${open ? ' rte-toolbar-btn--active' : ''}`}
        title="Táblázat beillesztése"
        type="button"
        onClick={() => setOpen(v => !v)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="1" y="1" width="6" height="6" rx="1" opacity=".9"/>
          <rect x="9" y="1" width="6" height="6" rx="1" opacity=".5"/>
          <rect x="1" y="9" width="6" height="6" rx="1" opacity=".5"/>
          <rect x="9" y="9" width="6" height="6" rx="1" opacity=".3"/>
        </svg>
      </button>

      {open && (
        <div className="rte-table-picker">
          <div className="rte-table-picker__label">
            {hoverR > 0 && hoverC > 0
              ? `${hoverR} × ${hoverC} táblázat`
              : 'Húzd ki a méretet'}
          </div>

          <div
            className="rte-table-picker__grid"
            style={{ gridTemplateColumns: `repeat(${COLS}, 22px)` }}
          >
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const row = Math.floor(i / COLS) + 1;
              const col = (i % COLS) + 1;
              const active = row <= hoverR && col <= hoverC;
              return (
                <div
                  key={i}
                  className={`rte-table-picker__cell${active ? ' rte-table-picker__cell--active' : ''}`}
                  onMouseEnter={() => { setHoverR(row); setHoverC(col); }}
                  onMouseLeave={() => { setHoverR(0); setHoverC(0); }}
                  onClick={() => handleInsert(row, col)}
                />
              );
            })}
          </div>

          <div className="rte-table-picker__divider" />

          <button
            className="rte-table-picker__custom-btn"
            onClick={() => {
              const input = window.prompt('Sorok × Oszlopok (pl. 4x6)', '3x3');
              if (!input) return;
              const [r, c] = input.split(/[x×,;]/).map(Number);
              if (r > 0 && c > 0) handleInsert(r, c);
            }}
          >
            Egyéni méret...
          </button>
        </div>
      )}
    </div>
  );
}