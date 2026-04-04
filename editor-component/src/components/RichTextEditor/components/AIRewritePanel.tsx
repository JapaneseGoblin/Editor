import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import {
  Box, TextField, IconButton, CircularProgress,
  Tooltip, Paper,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useAI } from '../hooks/useAI';

interface AIRewritePanelProps {
  editor: Editor;
}

const QUICK_ACTIONS = [
  { label: 'Rövidebb',    instruction: 'Tedd rövidebbé, tömörebb legyen' },
  { label: 'Hosszabb',    instruction: 'Fejts ki részletesebben' },
  { label: 'Formálisabb', instruction: 'Tedd formálisabbá, professzionálisabbá' },
  { label: 'Javítás',     instruction: 'Javítsd a nyelvtani és helyesírási hibákat' },
];

export default function AIRewritePanel({ editor }: AIRewritePanelProps) {
  const [open,        setOpen]        = useState(false);
  const [panelStyle,  setPanelStyle]  = useState<React.CSSProperties>({});
  const [instruction, setInstruction] = useState('');
  const [suggestion,  setSuggestion]  = useState('');
  const [error,       setError]       = useState('');
  const btnRef = useRef<HTMLButtonElement>(null);
  const { isLoading, rewrite, abort } = useAI();

  // Lekérjük a kijelölt szöveget mielőtt a bubble menü eltűnne
  const selectionRef = useRef('');

  const captureSelection = () => {
    const { from, to } = editor.state.selection;
    selectionRef.current = editor.state.doc.textBetween(from, to, ' ');
  };

  const handleOpen = () => {
    captureSelection();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const panelW = 300;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - panelW - 8));
      setPanelStyle({ position: 'fixed', top: rect.bottom + 8, left, zIndex: 9999 });
    }
    setOpen(true);
  };

  const handleRewrite = async (customInstruction?: string) => {
    const text = selectionRef.current;
    if (!text) return;
    setSuggestion('');
    setError('');
    try {
      const result = await rewrite(text, customInstruction ?? instruction);
      setSuggestion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt.');
    }
  };

  const handleAccept = () => {
    if (!suggestion) return;
    editor.chain().focus().insertContent(suggestion).run();
    setSuggestion('');
    setInstruction('');
    setOpen(false);
  };

  const handleClose = () => {
    abort();
    setSuggestion('');
    setInstruction('');
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="AI átírás" placement="top" arrow>
        <IconButton
          ref={btnRef}
          size="small"
          onClick={handleOpen}
          sx={{
            borderRadius: 1, p: 0.5,
            color: open ? 'primary.main' : 'text.secondary',
            bgcolor: open ? 'primary.lighter' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {open && createPortal(
        <Paper elevation={6} style={panelStyle} sx={{ p: 1.5, minWidth: 300, maxWidth: 400, maxHeight: '80vh', overflowY: 'auto' }}>

          {/* Gyors műveletek */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {QUICK_ACTIONS.map(action => (
              <Box key={action.label} component="button"
                onClick={() => handleRewrite(action.instruction)}
                disabled={isLoading}
                sx={{
                  px: 1, py: 0.25, fontSize: 11, borderRadius: 1, cursor: 'pointer',
                  border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper', color: 'text.primary',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                }}
              >
                {action.label}
              </Box>
            ))}
          </Box>

          {/* Egyéni utasítás */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <TextField size="small" fullWidth placeholder="Egyéni utasítás..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRewrite(); }}
              disabled={isLoading} sx={{ fontSize: 12 }}
            />
            <IconButton size="small" onClick={() => handleRewrite()} disabled={isLoading || !instruction}>
              {isLoading ? <CircularProgress size={14} /> : <AutoFixHighIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Box>

          {/* Hiba */}
          {error && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1, fontSize: 12, color: 'error.main' }}>
              {error}
            </Box>
          )}

          {/* Eredmény */}
          {suggestion && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1, fontSize: 13, color: 'text.primary' }}>
              {suggestion}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                <Tooltip title="Elfogad" arrow>
                  <IconButton size="small" color="success" onClick={handleAccept}>
                    <CheckIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Elvet" arrow>
                  <IconButton size="small" onClick={() => setSuggestion('')}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}

          <IconButton size="small" onClick={handleClose}
            sx={{ position: 'absolute', top: 4, right: 4, p: 0.25, color: 'text.disabled' }}>
            <CloseIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Paper>,
        document.body
      )}
    </>
  );
}