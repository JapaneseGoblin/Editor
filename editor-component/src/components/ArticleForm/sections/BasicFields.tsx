import { useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField,
  FormControl, InputLabel, Select, MenuItem,
  Button,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteOutlineIcon             from '@mui/icons-material/DeleteOutline';
import type { Rovat } from '../types';
import { ROVAT_LABELS }              from '../types';

interface BasicFieldsProps {
  cim:          string;
  szerzo:       string;
  kepPreview:   string | null;
  rovat:        Rovat;
  onCimChange:   (v: string) => void;
  onSzerzoChange:(v: string) => void;
  onKepChange:   (file: File | null) => void;
  onRovatChange: (v: Rovat) => void;
}

export default function BasicFields({
  cim, szerzo, kepPreview, rovat,
  onCimChange, onSzerzoChange, onKepChange, onRovatChange,
}: BasicFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onKepChange(file);
    e.target.value = '';
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Cím */}
        <TextField
          label="Cím"
          required
          fullWidth
          value={cim}
          onChange={e => onCimChange(e.target.value)}
          placeholder="Cikk címe..."
          inputProps={{ maxLength: 200 }}
        />

        {/* Szerző */}
        <TextField
          label="Szerző"
          fullWidth
          value={szerzo}
          onChange={e => onSzerzoChange(e.target.value)}
          placeholder="Szerző neve..."
        />

        {/* Kép */}
        <Box>
          <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 0.75 }}>
            Kép
          </Typography>

          {kepPreview ? (
            <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <Box
                component="img"
                src={kepPreview}
                alt="Előnézet"
                sx={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 1.5, display: 'block' }}
              />
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onKepChange(null)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                Törlés
              </Button>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border:        '1.5px dashed',
                borderColor:   'divider',
                borderRadius:  1.5,
                p:             3,
                textAlign:     'center',
                cursor:        'pointer',
                bgcolor:       'grey.50',
                transition:    'border-color .15s, background-color .15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
              }}
            >
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary">Kattints a kép feltöltéséhez</Typography>
              <Typography variant="caption" color="text.disabled">JPG, PNG, WEBP – max. 5 MB</Typography>
            </Box>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>

        {/* Rovat */}
        <FormControl fullWidth required>
          <InputLabel>Rovat</InputLabel>
          <Select
            label="Rovat"
            value={rovat}
            onChange={e => onRovatChange(e.target.value as Rovat)}
          >
            <MenuItem value=""><em>— Válassz rovatot —</em></MenuItem>
            {(Object.entries(ROVAT_LABELS) as [Exclude<Rovat, ''>, string][]).map(([value, label]) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

      </CardContent>
    </Card>
  );
}