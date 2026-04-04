import { useState, useCallback, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { IconLayout } from '../ResizableImage/icons';
import { useResizable } from '../../../hooks/useResizable';
import LayoutPanel from '../../../components/LayoutPanel';

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export default function VideoEmbedView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const { src, width, align, float: floatVal } = node.attrs as {
    src: string; width: string; align: string; float: string;
  };

  const [editing, setEditing] = useState(!src);
  const layoutBtnRef = useRef<HTMLButtonElement>(null);
  const [input,   setInput]   = useState(src || '');

  const { containerRef, onResizeStart, setLayout, isFloat, showPanel, setShowPanel } =
    useResizable({ width, floatVal, align, selected: selected ?? false, updateAttributes, minWidth: 200, fallbackWidth: 560 });

  const handleSave = useCallback(() => {
    const url = input.trim();
    if (!url) return;
    updateAttributes({ src: url });
    setEditing(false);
  }, [input, updateAttributes]);

  const stop     = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const embedUrl = getEmbedUrl(src);

  // Videónál mindig block display, hogy a 100% szélesség legyen értelmezett
  const videoWrapperStyle: React.CSSProperties = isFloat ? {
    float:   floatVal as 'left' | 'right',
    width:   width,
    margin:  floatVal === 'left' ? '0.25rem 1.25rem 0.5rem 0' : '0.25rem 0 0.5rem 1.25rem',
    display: 'block',
  } : {
    display:     'block',
    width:       width === '100%' ? '100%' : width,
    maxWidth:    '100%',
    marginLeft:  (align === 'right' || align === 'center') ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : '0',
  };

  return (
    <NodeViewWrapper style={videoWrapperStyle} data-drag-handle>
      <div
        ref={containerRef}
        className={`rte-video-wrapper${selected ? ' rte-video-wrapper--selected' : ''}`}
        style={{ position: 'relative', width: '100%' }}
      >
        {editing || !src ? (
          <Box sx={{ p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>🎬 Videó beillesztése</Typography>
            <TextField
              fullWidth size="small"
              placeholder="YouTube / Vimeo URL vagy MP4 link..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleSave}>Beillesztés</Button>
              {src && <Button size="small" variant="outlined" onClick={() => setEditing(false)}>Mégse</Button>}
              <Button size="small" variant="outlined" color="error" onClick={() => deleteNode?.()}>Törlés</Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ borderRadius: 2, outline: selected ? '2px solid #3b82f6' : 'none', position: 'relative', overflow: 'hidden' }}>
              {isDirectVideo(src) ? (
                <video src={src} controls style={{ width: '100%', display: 'block' }} />
              ) : (
                <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src={embedUrl ?? ''}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="Videó"
                  />
                  {selected && <Box sx={{ position: 'absolute', inset: 0, zIndex: 5, cursor: 'default' }} />}
                </Box>
              )}
            </Box>

            {selected && (
              <>
                <div className="rte-image-resize-handle" onMouseDown={onResizeStart}
                  style={{ position: 'absolute', bottom: 4, right: 4, zIndex: 20 }} />
                <button ref={layoutBtnRef} className="rte-image-layout-trigger" title="Elrendezés"
                  onMouseDown={(e) => { stop(e); setShowPanel((v: boolean) => !v); }}>
                  <IconLayout />
                </button>
                <button className="rte-image-edit-btn" title="URL szerkesztése"
                  onMouseDown={(e) => { stop(e); setInput(src); setEditing(true); }}>
                  ✏️
                </button>
              </>
            )}

            {showPanel && (
              <LayoutPanel
                floatVal={floatVal}
                align={align}
                onSetLayout={setLayout}
                onClose={() => setShowPanel(false)}
                triggerRef={layoutBtnRef}
              />
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}