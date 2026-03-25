import { useState, useCallback } from 'react';

export function usePageBackground(articleId) {
  const bgKey = `rte_bgcolor_${articleId}`;

  const [bgColor, setBgColor] = useState(
    () => localStorage.getItem(bgKey) || '#ffffff'
  );

  const handleBgColorChange = useCallback((color) => {
    setBgColor(color);
    localStorage.setItem(bgKey, color);
  }, [bgKey]);

  return { bgColor, handleBgColorChange };
}