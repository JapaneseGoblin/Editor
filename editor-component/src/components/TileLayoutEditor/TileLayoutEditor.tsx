import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Divider, Drawer,
  IconButton, Tooltip, Snackbar, Alert, useMediaQuery, useTheme,
} from '@mui/material';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

import { MOCK_ARTICLES } from '../../data/mockArticles';
import type { ArticleData } from '../../data/mockArticles';
import type { TileSize } from './types';
import { useTileLayout } from './hooks/useTileLayout';
import ArticlePicker from './components/ArticlePicker';
import type { ArticlePickerHandle } from './components/ArticlePicker';
import TileGrid from './components/TileGrid';
import SizePicker from './components/SizePicker';

const SIDEBAR_WIDTH = 280;

type PickerState =
  | { open: false }
  | { open: true; mode: 'add'; article: ArticleData }
  | { open: true; mode: 'resize'; tileId: string; article: ArticleData; currentSize: TileSize };

export default function TileLayoutEditor() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate  = useNavigate();

  const { tiles, addTile, removeTile, resizeTile, moveTile, reorderTiles, clearAll } = useTileLayout();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [picker, setPicker]         = useState<PickerState>({ open: false });
  const [preview, setPreview]       = useState(false);
  const [saved, setSaved]           = useState(false);

  const pickerRef = useRef<ArticlePickerHandle>(null);

  const handleArticleSelect = useCallback((article: ArticleData) => {
    setPicker({ open: true, mode: 'add', article });
    if (isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const handleOpenResize = useCallback((tileId: string) => {
    const tile = tiles.find(t => t.tileId === tileId);
    if (!tile) return;
    const article = MOCK_ARTICLES.find(a => a.id === tile.articleId);
    if (!article) return;
    setPicker({ open: true, mode: 'resize', tileId, article, currentSize: tile.size });
  }, [tiles]);

  const handlePickSize = useCallback((size: TileSize) => {
    if (!picker.open) return;
    if (picker.mode === 'add') {
      addTile(picker.article.id, size);
    } else {
      resizeTile(picker.tileId, size);
    }
    setPicker({ open: false });
  }, [picker, addTile, resizeTile]);

  const handleAddClick = useCallback(() => {
    if (isMobile) setDrawerOpen(true);
    else pickerRef.current?.focusSearch();
  }, [isMobile]);

  const handleEditTile = useCallback((articleId: string) => {
    navigate(`/article/${articleId}/form`);
  }, [navigate]);

  const handleSave = useCallback(() => {
    console.log('[TileLayoutEditor] Mentett elrendezés:',
      tiles.map(t => ({ articleId: t.articleId, size: t.size }))
    );
    setSaved(true);
  }, [tiles]);

  const usedIds = new Set(tiles.map(t => t.articleId));

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {isMobile && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography fontWeight={700} fontSize="0.9rem">Cikkek</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      <ArticlePicker
        ref={pickerRef}
        articles={MOCK_ARTICLES}
        usedArticleIds={usedIds}
        onSelect={handleArticleSelect}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* Bal panel – desktop */}
      {!isMobile && (
        <Box sx={{
          width: SIDEBAR_WIDTH, flexShrink: 0,
          borderRight: '1px solid', borderColor: 'divider',
          height: '100%', overflow: 'hidden',
        }}>
          {sidebarContent}
        </Box>
      )}

      {/* Mobil drawer */}
      {isMobile && (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}>
          {sidebarContent}
        </Drawer>
      )}

      {/* Jobb oldal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 2, py: 1,
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper', flexShrink: 0,
        }}>
          {isMobile && (
            <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography fontWeight={800} fontSize="1rem" sx={{ flex: 1 }}>
            Csempe-szerkesztő
          </Typography>
          <Typography variant="caption" color="text.secondary"
            sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {tiles.length} kártya
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate('/article/new')}
            sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.78rem', mr: 0.5 }}
          >
            Új cikk
          </Button>
          <Tooltip title={preview ? 'Szerkesztés' : 'Előnézet'}>
            <IconButton size="small" onClick={() => setPreview(v => !v)} color={preview ? 'primary' : 'default'}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Összes törlése">
            <span>
              <IconButton size="small" onClick={clearAll} disabled={tiles.length === 0} color="error">
                <DeleteSweepIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Button
            variant="contained" size="small" startIcon={<SaveIcon />}
            onClick={handleSave} disabled={tiles.length === 0}
            disableElevation
            sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
          >
            Mentés
          </Button>
        </Box>

        {/* Szerkesztő terület */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2.5 } }}>
          {preview && (
            <Box sx={{ mb: 1.5, px: 1.5, py: 0.75, bgcolor: 'info.light', color: 'info.dark', borderRadius: 2, fontSize: '0.8rem', fontWeight: 600 }}>
              Előnézet – szerkesztés ki van kapcsolva
            </Box>
          )}
          <TileGrid
            tiles={tiles}
            articles={MOCK_ARTICLES}
            editable={!preview}
            onRemoveTile={removeTile}
            onMoveTile={moveTile}
            onReorderTiles={reorderTiles}
            onAddClick={handleAddClick}
            onOpenResize={handleOpenResize}
            onEditTile={handleEditTile}
          />
        </Box>
      </Box>

      <SizePicker
        open={picker.open}
        article={picker.open ? picker.article : null}
        mode={picker.open ? picker.mode : 'add'}
        currentSize={picker.open && picker.mode === 'resize' ? picker.currentSize : undefined}
        onPick={handlePickSize}
        onClose={() => setPicker({ open: false })}
      />

      <Snackbar open={saved} autoHideDuration={2500} onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2, fontWeight: 600 }}>
          Elrendezés elmentve ({tiles.length} kártya)
        </Alert>
      </Snackbar>
    </Box>
  );
}