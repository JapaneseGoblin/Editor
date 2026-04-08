import { useState, useCallback } from 'react';
import type { TileItem, TileSize } from '../types';

let counter = 0;
function uid() {
  return `tile-${Date.now()}-${++counter}`;
}

export function useTileLayout(initial: TileItem[] = []) {
  const [tiles, setTiles] = useState<TileItem[]>(initial);

  const addTile = useCallback((articleId: string, size: TileSize) => {
    setTiles(prev => [...prev, { tileId: uid(), articleId, size }]);
  }, []);

  const removeTile = useCallback((tileId: string) => {
    setTiles(prev => prev.filter(t => t.tileId !== tileId));
  }, []);

  const resizeTile = useCallback((tileId: string, size: TileSize) => {
    setTiles(prev => prev.map(t => t.tileId === tileId ? { ...t, size } : t));
  }, []);

  const moveTile = useCallback((tileId: string, dir: 'up' | 'down') => {
    setTiles(prev => {
      const idx = prev.findIndex(t => t.tileId === tileId);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, []);

  const reorderTiles = useCallback((fromId: string, toId: string) => {
    setTiles(prev => {
      const from = prev.findIndex(t => t.tileId === fromId);
      const to   = prev.findIndex(t => t.tileId === toId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setTiles([]), []);

  return { tiles, addTile, removeTile, resizeTile, moveTile, reorderTiles, clearAll };
}