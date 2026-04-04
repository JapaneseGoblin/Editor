import { useState, useCallback } from 'react';

export function usePageBackground(articleId: string | number) {
  const bgKey = `rte_bgcolor_${articleId}`;

  const [bgColor, setBgColor] = useState<string>(
    () => localStorage.getItem(bgKey) ?? '#ffffff'
  );

  const handleBgColorChange = useCallback((color: string) => {
    setBgColor(color);
    localStorage.setItem(bgKey, color);
  }, [bgKey]);

  return { bgColor, handleBgColorChange };
}