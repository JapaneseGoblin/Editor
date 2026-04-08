import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Box, IconButton,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { getToken, setToken, clearToken } from '../../../utils/apiClient';

interface AuthTokenDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AuthTokenDialog({ open, onClose }: AuthTokenDialogProps) {
  const [input, setInput] = useState(() => getToken() ?? '');

  const handleSave = () => {
    const trimmed = input.trim();
    if (trimmed) setToken(trimmed);
    else clearToken();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      key={open ? 'open' : 'closed'}
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockOpenIcon fontSize="small" />
          <Typography fontWeight={700}>API Token beállítása</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 0.5 }}>
          A képfeltöltéshez Bearer token szükséges. A token a böngészőben tárolódik
          (localStorage), oldalfrissítés után is megmarad.
        </Typography>
        <TextField
          label="Bearer Token"
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          size="small"
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          type="password"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: 'monospace', fontSize: '0.8rem' } }}
        />
        {getToken() && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
            ✓ Token már be van állítva
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => { clearToken(); onClose(); }} color="error" size="small">
          Token törlése
        </Button>
        <Button onClick={onClose} size="small">Mégse</Button>
        <Button onClick={handleSave} variant="contained" size="small"
          disableElevation sx={{ borderRadius: 2, fontWeight: 700 }}>
          Mentés
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Auth gomb
export function AuthTokenButton() {
  const [open, setOpen] = useState(false);
  const hasToken = !!getToken();

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        title={hasToken ? 'API token beállítva' : 'API token szükséges'}
        sx={{ color: hasToken ? 'success.main' : 'warning.main' }}
      >
        {hasToken ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
      </IconButton>
      <AuthTokenDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}