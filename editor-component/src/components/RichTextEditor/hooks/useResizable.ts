import { useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';

interface UseResizableOptions {
  width: string;
  floatVal: string;
  align: string;
  selected: boolean;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  minWidth?: number;
  fallbackWidth?: number;
}

interface UseResizableReturn {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onResizeStart: (e: React.MouseEvent) => void;
  setLayout: (newFloat: string, newAlign: string) => void;
  isFloat: boolean;
  wrapperStyle: CSSProperties;
  showPanel: boolean;
  setShowPanel: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useResizable({
  width,
  floatVal,
  align,
  selected,
  updateAttributes,
  minWidth = 100,
  fallbackWidth = 400,
}: UseResizableOptions): UseResizableReturn {
  const containerRef  = useRef<HTMLDivElement>(null);
  const startXRef     = useRef(0);
  const startWidthRef = useRef(0);
  const [panelOpen, setPanelOpen] = useState(false);

  // Panel csak akkor látható ha ki is van jelölve a node
  const showPanel = selected && panelOpen;
  const setShowPanel = (value: boolean | ((prev: boolean) => boolean)) => {
    setPanelOpen(value);
  };

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current     = e.clientX;
    startWidthRef.current = containerRef.current?.offsetWidth ?? fallbackWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
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

  const setLayout = useCallback((newFloat: string, newAlign: string) => {
    const updates: Record<string, unknown> = { float: newFloat, align: newAlign };
    if (newFloat !== 'none' && (!width || !width.endsWith('px'))) {
      const domPx = containerRef.current?.offsetWidth ?? 0;
      updates.width = `${domPx > 0 ? domPx : fallbackWidth}px`;
    }
    updateAttributes(updates);
    setShowPanel(false);
  }, [width, updateAttributes, fallbackWidth]);

  const isFloat = Boolean(floatVal && floatVal !== 'none');

  const wrapperStyle: CSSProperties = isFloat ? {
    float:       floatVal as 'left' | 'right',
    width,
    margin:      floatVal === 'left' ? '0.25rem 1.25rem 0.5rem 0' : '0.25rem 0 0.5rem 1.25rem',
    display:     'block',
  } : {
    display:     'block',
    width:       'fit-content',
    maxWidth:    '100%',
    marginLeft:  (align === 'right' || align === 'center') ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : '0',
  };

  return { containerRef, onResizeStart, setLayout, isFloat, wrapperStyle, showPanel, setShowPanel };
}