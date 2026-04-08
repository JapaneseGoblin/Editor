import {
  Dialog, DialogTitle, DialogContent,
  Box, Typography, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { TileSize } from '../types';
import { TILE_SIZES, TILE_SIZE_ORDER } from '../types';
import type { ArticleData } from '../../../data/mockArticles';

interface SizePickerProps {
  open: boolean;
  article: ArticleData | null;
  mode: 'add' | 'resize';
  currentSize?: TileSize;
  onPick: (size: TileSize) => void;
  onClose: () => void;
}

/** Mini rács vizuális méret-előnézet */
function SizePreview({ size }: { size: TileSize }) {
  const cfg = TILE_SIZES[size];

  const cells: { col: number; row: number; filled: boolean }[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      cells.push({ col: c, row: r, filled: r < cfg.rowSpan && c < cfg.colSpan });
    }
  }

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: '3px',
      width: 64,
      height: 32,
    }}>
      {cells.map((cell, i) => (
        <Box key={i} sx={{
          borderRadius: '2px',
          bgcolor: cell.filled ? 'primary.main' : 'action.hover',
          transition: 'background-color 0.15s',
        }} />
      ))}
    </Box>
  );
}

export default function SizePicker({ open, article, mode, currentSize, onPick, onClose }: SizePickerProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1, pr: 5 }}>
        <Typography fontWeight={700} fontSize="1rem">
          {mode === 'add' ? 'Válassz méretet' : 'Méret módosítása'}
        </Typography>
        {article && (
          <Typography variant="caption" color="text.secondary" sx={{
            display: 'block',
            mt: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {article.title}
          </Typography>
        )}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 10, right: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {TILE_SIZE_ORDER.map(size => {
            const cfg = TILE_SIZES[size];
            const isActive = size === currentSize;

            return (
              <Box
                key={size}
                onClick={() => onPick(size)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  bgcolor: isActive ? 'primary.50' : 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <SizePreview size={size} />

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} fontSize="0.9rem" lineHeight={1.2}>
                    {cfg.label}
                    <Typography component="span"
                      sx={{ ml: 1, fontWeight: 400, fontSize: '0.75rem', color: 'text.secondary' }}>
                      ({size})
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cfg.desc}
                  </Typography>
                </Box>

                {isActive && (
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: 'primary.main', flexShrink: 0,
                  }} />
                )}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
    </Dialog>
  );
}