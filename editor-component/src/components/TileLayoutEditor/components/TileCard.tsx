import { useState } from 'react';
import { Box, Chip, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import type { ArticleData } from '../../../data/mockArticles';
import type { TileSize } from '../types';

interface TileCardProps {
  article: ArticleData;
  size: TileSize;
  editable?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onRemove?: () => void;
  onResize?: () => void;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const TITLE_SIZES: Record<TileSize, object> = {
  S:   { xs: '1rem',   md: '1.1rem'  },
  M:   { xs: '1.2rem', md: '1.35rem' },
  L:   { xs: '1.5rem', md: '1.75rem' },
  XL:  { xs: '1.3rem', md: '1.5rem'  },
  XXL: { xs: '1.7rem', md: '2rem'    },
};

function stopDnd(e: React.PointerEvent | React.MouseEvent) {
  e.stopPropagation();
}

function EdgeArrow({
  direction, disabled, tooltip, onClick,
}: {
  direction: 'up' | 'down' | 'left' | 'right';
  disabled: boolean;
  tooltip: string;
  onClick?: () => void;
}) {
  const POS: Record<string, React.CSSProperties> = {
    up:    { top: 6,    left: '50%', transform: 'translateX(-50%)' },
    down:  { bottom: 6, left: '50%', transform: 'translateX(-50%)' },
    left:  { left: 6,   top: '50%',  transform: 'translateY(-50%)' },
    right: { right: 6,  top: '50%',  transform: 'translateY(-50%)' },
  };
  const ICONS = {
    up:    <ArrowUpwardIcon sx={{ fontSize: 13 }} />,
    down:  <ArrowDownwardIcon sx={{ fontSize: 13 }} />,
    left:  <ArrowBackIcon sx={{ fontSize: 13 }} />,
    right: <ArrowForwardIcon sx={{ fontSize: 13 }} />,
  };

  return (
    <Tooltip title={disabled ? '' : tooltip} placement="top">
      <span style={{ position: 'absolute', zIndex: 12, ...POS[direction] }}>
        <IconButton
          size="small"
          disabled={disabled}
          onPointerDown={stopDnd}
          onClick={e => { stopDnd(e); onClick?.(); }}
          sx={{
            width: 26, height: 26,
            color: '#fff',
            bgcolor: disabled ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(0,0,0,0.15)' },
          }}
        >
          {ICONS[direction]}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default function TileCard({
  article, size, editable = false,
  isFirst = false, isLast = false,
  dragHandleProps,
  onRemove, onResize, onEdit, onMoveUp, onMoveDown,
}: TileCardProps) {
  const [hovered, setHovered] = useState(false);
  const showBadge = size !== 'S';
  const showDesc  = size === 'L' || size === 'XXL';

  return (
    <Box
      onMouseEnter={() => editable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative', height: '100%', borderRadius: 2, overflow: 'hidden',
        bgcolor: 'grey.900',
        backgroundImage: `url(${article.image})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        outline: editable && hovered ? '2px solid' : 'none',
        outlineColor: 'primary.main', transition: 'outline 0.15s',
        cursor: editable ? 'default' : 'pointer',
      }}
    >
      {/* Sötétítő gradient */}
      <Box sx={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.5) 100%)',
      }} />

      {/* Típus badge */}
      {showBadge && (
        <Chip label={article.type.toUpperCase()} size="small" sx={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          color: '#fff', border: '1px solid rgba(255,255,255,0.35)',
          bgcolor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
          fontWeight: 700, fontSize: 10, height: 22,
        }} />
      )}

      {/* Tartalom */}
      <Box sx={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        p: size === 'S' ? 1 : 1.75, zIndex: 2,
      }}>
        <Typography sx={{
          color: '#fff', fontWeight: 900, lineHeight: 1.15,
          fontSize: TITLE_SIZES[size],
          mb: showDesc ? 0.75 : 0,
          display: '-webkit-box', WebkitLineClamp: size === 'S' ? 3 : 4,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          letterSpacing: '-0.02em', textShadow: '0 1px 4px rgba(0,0,0,0.6)',
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
        {!editable && size !== 'S' && (
          <Box sx={{
            position: 'absolute', bottom: 14, right: 14,
            border: '1.5px solid rgba(255,255,255,0.45)', borderRadius: 1,
            px: 1.5, py: 0.4, fontSize: '0.7rem', fontWeight: 700,
            color: '#fff', letterSpacing: '0.04em', cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
          }}>
            OLVASS EL
          </Box>
        )}
      </Box>

      {/* ── Szerkesztő vezérlők ── */}
      {editable && hovered && (
        <>
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.25)', zIndex: 8 }} />

          <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 13, display: 'flex', gap: 0.4 }}>
            <Tooltip title="Húzd át">
              <IconButton
                size="small"
                {...dragHandleProps}
                sx={{
                  width: 26, height: 26, cursor: 'grab',
                  color: '#fff', bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIndicatorIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Méret">
              <IconButton
                size="small"
                onPointerDown={stopDnd}
                onClick={e => { stopDnd(e); onResize?.(); }}
                sx={{ width: 26, height: 26, color: '#fff', bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}
              >
                <OpenWithIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cikk szerkesztése">
              <IconButton
                size="small"
                onPointerDown={stopDnd}
                onClick={e => { stopDnd(e); onEdit?.(); }}
                sx={{ width: 26, height: 26, color: '#fff', bgcolor: 'rgba(0,100,200,0.6)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(0,130,255,0.8)' } }}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eltávolítás">
              <IconButton
                size="small"
                onPointerDown={stopDnd}
                onClick={e => { stopDnd(e); onRemove?.(); }}
                sx={{ width: 26, height: 26, color: '#fff', bgcolor: 'rgba(180,0,0,0.6)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(220,0,0,0.8)' } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <EdgeArrow direction="up"    disabled={isFirst} tooltip="Előrébb"  onClick={onMoveUp}   />
          <EdgeArrow direction="down"  disabled={isLast}  tooltip="Hátrébb"  onClick={onMoveDown} />
          <EdgeArrow direction="left"  disabled={isFirst} tooltip="Előrébb"  onClick={onMoveUp}   />
          <EdgeArrow direction="right" disabled={isLast}  tooltip="Hátrébb"  onClick={onMoveDown} />
        </>
      )}
    </Box>
  );
}