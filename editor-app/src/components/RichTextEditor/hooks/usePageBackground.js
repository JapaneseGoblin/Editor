import { useState, useCallback } from 'react';

const BG_KEY = 'rte_bgcolor';

export function usePageBackground() {
  const [bgColor, setBgColor] = useState(
    () => localStorage.getItem(BG_KEY) || '#ffffff'
  );

  const handleBgColorChange = useCallback((color) => {
    setBgColor(color);
    localStorage.setItem(BG_KEY, color);
  }, []);

  return { bgColor, handleBgColorChange };
}