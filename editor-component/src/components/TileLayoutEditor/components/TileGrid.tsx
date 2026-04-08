import { useRef, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TileItem } from '../types';
import { TILE_SIZES } from '../types';
import type { ArticleData } from '../../../data/mockArticles';
import TileCard from './TileCard';

interface TileGridProps {
  tiles: TileItem[];
  articles: ArticleData[];
  editable?: boolean;
  onRemoveTile: (tileId: string) => void;
  onMoveTile: (tileId: string, dir: 'up' | 'down') => void;
  onReorderTiles: (fromId: string, toId: string) => void;
  onAddClick?: () => void;
  onOpenResize?: (tileId: string) => void;
  onEditTile?: (articleId: string) => void;
}

const GAP = 8;
const COLS = 4;

// ── Sortable kártya wrapper ───────────────────────────────────
interface SortableTileProps {
  tile: TileItem;
  article: ArticleData;
  editable: boolean;
  isFirst: boolean;
  isLast: boolean;
  isDraggingThis: boolean;
  onRemove: () => void;
  onResize: () => void;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableTile({
  tile, article, editable, isFirst, isLast, isDraggingThis,
  onRemove, onResize, onEdit, onMoveUp, onMoveDown,
}: SortableTileProps) {
  const cfg = TILE_SIZES[tile.size];
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tile.tileId });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        gridColumn: `span ${cfg.colSpan}`,
        gridRow: `span ${cfg.rowSpan}`,
        opacity: isDraggingThis ? 0.35 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <TileCard
        article={article}
        size={tile.size}
        editable={editable}
        isFirst={isFirst}
        isLast={isLast}
        dragHandleProps={{ ...attributes, ...listeners } as Record<string, unknown>}
        onRemove={onRemove}
        onResize={onResize}
        onEdit={onEdit}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
    </Box>
  );
}

// ── Fő grid komponens ─────────────────────────────────────────
export default function TileGrid({
  tiles, articles, editable = false,
  onRemoveTile, onMoveTile, onReorderTiles,
  onAddClick, onOpenResize, onEditTile,
}: TileGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(200);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Dinamikus sormagasság = oszlopszélesség → S kártyák négyzetesek
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.getBoundingClientRect().width;
      setRowHeight(Math.round((w - GAP * (COLS - 1)) / COLS));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const articleMap = new Map(articles.map(a => [a.id, a]));
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  }));

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      onReorderTiles(String(active.id), String(over.id));
    }
    setActiveId(null);
  }

  const activeTile    = activeId ? tiles.find(t => t.tileId === activeId) : null;
  const activeArticle = activeTile ? articleMap.get(activeTile.articleId) : null;

  // Üres állapot
  if (tiles.length === 0 && editable) {
    return (
      <Box onClick={onAddClick} sx={{
        height: 220, border: '2px dashed', borderColor: 'divider', borderRadius: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 1, cursor: 'pointer', color: 'text.disabled', transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'action.hover' },
      }}>
        <AddIcon sx={{ fontSize: 36 }} />
        <Typography fontSize="0.9rem" fontWeight={600}>
          Adj hozzá cikkeket a bal oldali listából
        </Typography>
        <Typography fontSize="0.78rem">Kattints egy cikkre a hozzáadáshoz</Typography>
      </Box>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tiles.map(t => t.tileId)} strategy={rectSortingStrategy}>
        <Box
          ref={containerRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridAutoRows: `${rowHeight}px`,
            gap: `${GAP}px`,
          }}
        >
          {tiles.map((tile, idx) => {
            const article = articleMap.get(tile.articleId);
            if (!article) return null;
            return (
              <SortableTile
                key={tile.tileId}
                tile={tile}
                article={article}
                editable={editable}
                isFirst={idx === 0}
                isLast={idx === tiles.length - 1}
                isDraggingThis={tile.tileId === activeId}
                onRemove={() => onRemoveTile(tile.tileId)}
                onResize={() => onOpenResize?.(tile.tileId)}
                onEdit={() => onEditTile?.(tile.articleId)}
                onMoveUp={() => onMoveTile(tile.tileId, 'up')}
                onMoveDown={() => onMoveTile(tile.tileId, 'down')}
              />
            );
          })}

          {/* Hozzáadás gomb */}
          {editable && (
            <Box onClick={onAddClick} sx={{
              gridColumn: 'span 4',
              height: rowHeight,
              border: '2px dashed', borderColor: 'divider', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 1, cursor: 'pointer', color: 'text.disabled', transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'action.hover' },
            }}>
              <AddIcon sx={{ fontSize: 20 }} />
              <Typography fontSize="0.82rem" fontWeight={600}>Cikk hozzáadása</Typography>
            </Box>
          )}
        </Box>
      </SortableContext>

      {/* Drag overlay – a húzott kártya lebegő másolata */}
      <DragOverlay>
        {activeTile && activeArticle && (
          <Box sx={{
            gridColumn: `span ${TILE_SIZES[activeTile.size].colSpan}`,
            height: rowHeight * TILE_SIZES[activeTile.size].rowSpan + GAP * (TILE_SIZES[activeTile.size].rowSpan - 1),
            width: '100%',
            borderRadius: 2,
            opacity: 0.9,
            boxShadow: 8,
            cursor: 'grabbing',
          }}>
            <TileCard article={activeArticle} size={activeTile.size} editable={false} />
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}