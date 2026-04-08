import { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Grid, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, TextField, Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon      from '@mui/icons-material/Tune';
import { TEMATIKA_OPTIONS, CELCSOPORT_OPTIONS, MUFAJ_OPTIONS } from '../types';

interface ArticleSettingsProps {
  tematika:    string[];
  celcsoport:  string;
  mufaj:       string;
  onTematika:  (v: string[]) => void;
  onCelcsoport:(v: string) => void;
  onMufaj:     (v: string) => void;
}

export default function ArticleSettings({
  tematika, celcsoport, mufaj,
  onTematika, onCelcsoport, onMufaj,
}: ArticleSettingsProps) {
  const [open, setOpen] = useState(false);
  const hasValues = tematika.length > 0 || !!celcsoport || (!!mufaj && mufaj !== '');

  return (
    <Accordion
      expanded={open}
      onChange={(_, v) => setOpen(v)}
      variant="outlined"
      sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <TuneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
        <Typography fontWeight={500}>Cikk részletei</Typography>
        {hasValues && !open && (
          <Typography variant="caption" color="primary.main" sx={{ ml: 1.5, alignSelf: 'center' }}>
            kitöltve
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0 }}>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Célcsoport</InputLabel>
              <Select
                label="Célcsoport"
                value={celcsoport}
                onChange={e => onCelcsoport(e.target.value)}
              >
                <MenuItem value=""><em>— Válassz —</em></MenuItem>
                {CELCSOPORT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Műfaj</InputLabel>
              <Select
                label="Műfaj"
                value={mufaj}
                onChange={e => onMufaj(e.target.value)}
              >
                {MUFAJ_OPTIONS.map(o => (
                  <MenuItem key={o} value={o === '– Nincs –' ? '' : o}>
                    {o}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Autocomplete
          multiple
          options={TEMATIKA_OPTIONS}
          value={tematika}
          onChange={(_, val) => onTematika(val)}
          disableCloseOnSelect
          renderTags={(val, getTagProps) =>
            val.map((option, index) => (
              <Chip label={option} size="small" {...getTagProps({ index })} key={option} />
            ))
          }
          renderInput={params => (
            <TextField {...params} label="Tematika" placeholder="Válassz témákat..." />
          )}
        />

      </AccordionDetails>
    </Accordion>
  );
}
