import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip } from '@mui/material';
import { loadTileLayout } from '../../utils/tileLayoutStorage';
import { MOCK_ARTICLES } from '../../data/mockArticles';
import type { ArticleData } from '../../data/mockArticles';
import { TILE_SIZES } from '../TileLayoutEditor/types';
import type { TileSize } from '../TileLayoutEditor/types';

const GAP  = 8;
const COLS = 4;

interface TileItemView {
  tileId:    string;
  articleId: string;
  size:      TileSize;
}

const TITLE_SIZES: Record<TileSize, object> = {
  S:   { xs: '1rem',   md: '1.1rem'  },
  M:   { xs: '1.2rem', md: '1.35rem' },
  T:   { xs: '1.2rem', md: '1.35rem' },
  L:   { xs: '1.5rem', md: '1.75rem' },
  XL:  { xs: '1.3rem', md: '1.5rem'  },
  XXL: { xs: '1.7rem', md: '2rem'    },
};

function ViewCard({ article, size, onClick }: {
  article: ArticleData;
  size: TileSize;
  onClick: () => void;
}) {
  const showBadge = size !== 'S';
  const showDesc  = size === 'L' || size === 'XXL';

  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative', height: '100%', borderRadius: 2,
        overflow: 'hidden', bgcolor: 'grey.900', cursor: 'pointer',
        backgroundImage: `url(${article.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)', boxShadow: 6,
          '& .overlay': {
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.55) 100%)',
          },
        },
      }}
    >
      <Box className="overlay" sx={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.45) 100%)',
        transition: 'background 0.2s',
      }} />

      {showBadge && (
        <Chip label={article.type.toUpperCase()} size="small" sx={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          color: '#fff', border: '1px solid rgba(255,255,255,0.35)',
          bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          fontWeight: 700, fontSize: 10, height: 22,
        }} />
      )}

      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        p: size === 'S' ? 1 : 1.75, zIndex: 2,
      }}>
        <Typography sx={{
          color: '#fff', fontWeight: 900, lineHeight: 1.15,
          fontSize: TITLE_SIZES[size], letterSpacing: '-0.02em',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          mb: showDesc ? 0.75 : 0,
          display: '-webkit-box', WebkitLineClamp: size === 'S' ? 3 : 4,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </Typography>

        {showDesc && (
          <Typography sx={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: { xs: '0.78rem', md: '0.88rem' },
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {article.description}
          </Typography>
        )}

        {size !== 'S' && (
          <Typography sx={{
            position: 'absolute', bottom: 14, right: 14,
            border: '1.5px solid rgba(255,255,255,0.45)', borderRadius: 1,
            px: 1.5, py: 0.4, fontSize: '0.7rem', fontWeight: 700,
            color: '#fff', letterSpacing: '0.04em',
          }}>
            OLVASS EL
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function TileViewer() {
  const navigate     = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(200);

  const articleMap = new Map(MOCK_ARTICLES.map(a => [a.id, a]));

  const tiles: TileItemView[] = loadTileLayout().map((item, i) => ({
    tileId:    `view-${i}`,
    articleId: item.articleId,
    size:      item.size,
  }));

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

  if (tiles.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 1,
        bgcolor: 'background.default' }}>
        <Typography variant="h6" color="text.secondary">Még nincs közzétett elrendezés.</Typography>
        <Typography variant="body2" color="text.disabled">
          A szerkesztőben mentsd el az elrendezést a Mentés gombbal.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        ref={containerRef}
        sx={{
          maxWidth: 1400, mx: 'auto',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridAutoRows: `${rowHeight}px`,
          gap: `${GAP}px`,
        }}
      >
        {tiles.map(tile => {
          const article = articleMap.get(tile.articleId);
          if (!article) return null;
          const cfg = TILE_SIZES[tile.size];
          return (
            <Box
              key={tile.tileId}
              sx={{ gridColumn: `span ${cfg.colSpan}`, gridRow: `span ${cfg.rowSpan}` }}
            >
              <ViewCard
                article={article}
                size={tile.size}
                onClick={() => navigate(`/article/${article.id}`)}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}