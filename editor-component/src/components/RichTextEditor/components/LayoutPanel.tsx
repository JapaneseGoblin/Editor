import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LAYOUT_OPTIONS } from '../extensions/custom/ResizableImage/layoutOptions';

interface LayoutPanelProps {
  floatVal: string;
  align: string;
  onSetLayout: (newFloat: string, newAlign: string) => void;
  onClose: () => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

export default function LayoutPanel({ floatVal, align, onSetLayout, onClose, triggerRef }: LayoutPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  // Fixed pozícionálás a trigger gomb alapján (mint a ColorPicker)
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>(
    { position: 'absolute', top: 38, left: 6, zIndex: 100 }
  );

  useLayoutEffect(() => {
    if (!triggerRef?.current) return;
    const rect   = triggerRef.current.getBoundingClientRect();
    const panelW = 200;
    const left   = rect.left + panelW > window.innerWidth - 8 ? rect.right - panelW : rect.left;
    setPanelStyle({ position: 'fixed', top: rect.bottom + 6, left: Math.max(8, left), zIndex: 9999 });
  }, [triggerRef]);

  // Kívülre kattintásra bezárás
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          triggerRef?.current && !triggerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, triggerRef]);

  const blockOptions = LAYOUT_OPTIONS.filter(o => o.float === 'none');
  const floatOptions = LAYOUT_OPTIONS.filter(o => o.float !== 'none');

  return (
    <Box
      ref={panelRef}
      onMouseDown={stop}
      style={panelStyle}
      sx={{
        bgcolor: '#1e2025',
        border: '1px solid #3a3d44',
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        p: 1.5,
        minWidth: 200,
        color: '#e5e7eb',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 1, borderBottom: '1px solid #3a3d44' }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#f3f4f6' }}>Elrendezés</Typography>
        <IconButton size="small" onMouseDown={(e) => { stop(e); onClose(); }} sx={{ color: '#9ca3af', p: 0.25 }}>
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>

      <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
        Sortöréssel
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, mb: 1 }}>
        {blockOptions.map(opt => (
          <Box key={opt.align} component="button"
            onMouseDown={(e) => { stop(e); onSetLayout(opt.float, opt.align); }}
            title={opt.label}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 36, border: '1px solid',
              borderColor: floatVal === opt.float && align === opt.align ? '#3b82f6' : '#3a3d44',
              borderRadius: 1, cursor: 'pointer',
              bgcolor: floatVal === opt.float && align === opt.align ? '#1d4ed8' : '#2a2d33',
              color: floatVal === opt.float && align === opt.align ? '#fff' : '#9ca3af',
              '&:hover': { bgcolor: '#3a3d44', color: '#e5e7eb' },
            }}
          ><opt.Icon /></Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#3a3d44', my: 0.5 }} />
      <Typography variant="caption" sx={{ color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
        Szöveg körbefolyása
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
        {floatOptions.map(opt => (
          <Box key={opt.float} component="button"
            onMouseDown={(e) => { stop(e); onSetLayout(opt.float, opt.align); }}
            title={opt.label}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 44, height: 36, border: '1px solid',
              borderColor: floatVal === opt.float ? '#3b82f6' : '#3a3d44',
              borderRadius: 1, cursor: 'pointer',
              bgcolor: floatVal === opt.float ? '#1d4ed8' : '#2a2d33',
              color: floatVal === opt.float ? '#fff' : '#9ca3af',
              '&:hover': { bgcolor: '#3a3d44', color: '#e5e7eb' },
            }}
          ><opt.Icon /></Box>
        ))}
      </Box>
    </Box>
  );
}