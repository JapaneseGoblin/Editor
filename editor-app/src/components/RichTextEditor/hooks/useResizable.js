import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Közös resize + layout logika képekhez és videókhoz.
 * @param {object} options
 * @param {string}   options.width         – jelenlegi szélesség attribútum
 * @param {string}   options.floatVal      – jelenlegi float attribútum
 * @param {string}   options.align         – jelenlegi align attribútum
 * @param {boolean}  options.selected      – ki van-e jelölve a node
 * @param {function} options.updateAttributes – Tiptap updateAttributes
 * @param {number}   [options.minWidth=100]  – minimális szélesség px-ben
 * @param {number}   [options.fallbackWidth=400] – fallback ha nincs DOM méret
 */
export function useResizable({
  width,
  floatVal,
  align,
  selected,
  updateAttributes,
  minWidth = 100,
  fallbackWidth = 400,
}) {
  const containerRef  = useRef(null);
  const startXRef     = useRef(0);
  const startWidthRef = useRef(0);
  const [showPanel, setShowPanel] = useState(false);

  // Panel bezárása ha elveszítjük a kijelölést
  useEffect(() => {
    if (!selected) setShowPanel(false);
  }, [selected]);

  const onResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current     = e.clientX;
    startWidthRef.current = containerRef.current
      ? containerRef.current.offsetWidth
      : fallbackWidth;

    const onMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startXRef.current;
      updateAttributes({ width: `${Math.max(minWidth, startWidthRef.current + diff)}px` });
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
  }, [updateAttributes, minWidth, fallbackWidth]);

  const setLayout = useCallback((newFloat, newAlign) => {
    const updates = { float: newFloat, align: newAlign };
    if (newFloat !== 'none' && (!width || !width.endsWith('px'))) {
      const domPx = containerRef.current ? containerRef.current.offsetWidth : 0;
      updates.width = `${domPx > 0 ? domPx : fallbackWidth}px`;
    }
    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes, fallbackWidth]);

  const isFloat = floatVal && floatVal !== 'none';

  const wrapperStyle = isFloat ? {
    float:   floatVal,
    width,
    margin:  floatVal === 'left' ? '0.25rem 1.25rem 0.5rem 0' : '0.25rem 0 0.5rem 1.25rem',
    display: 'block',
  } : {
    display:     'block',
    width:       'fit-content',
    maxWidth:    '100%',
    marginLeft:  (align === 'right' || align === 'center') ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : '0',
  };

  return { containerRef, onResizeStart, setLayout, isFloat, wrapperStyle, showPanel, setShowPanel };
}