import { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, TextField, ToggleButtonGroup, ToggleButton,
  Grid, Box,
} from '@mui/material';
import ExpandMoreIcon   from '@mui/icons-material/ExpandMore';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ColorPicker from '../../RichTextEditor/components/ColorPicker';
import RichEditorField from '../components/RichEditorField';
import type { EsemenyFormData } from '../types';

interface EventAccordionProps {
  esemeny:      EsemenyFormData;
  formDraftId:  string;
  onEsemeny:    <K extends keyof EsemenyFormData>(key: K, value: EsemenyFormData[K]) => void;
}

export default function EventAccordion({ esemeny, formDraftId, onEsemeny }: EventAccordionProps) {
  const [open, setOpen] = useState(false);
  const hasValues = !!(esemeny.cim || esemeny.helyszin || esemeny.mettol);

  return (
    <Accordion
      expanded={open}
      onChange={(_, v) => setOpen(v)}
      variant="outlined"
      sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <EventOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
        <Typography fontWeight={500}>Esemény</Typography>
        {hasValues && !open && (
          <Typography variant="caption" color="primary.main" sx={{ ml: 1.5, alignSelf: 'center' }}>
            kitöltve
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0 }}>

        {/* Mód váltó */}
        <ToggleButtonGroup
          exclusive
          size="small"
          value={esemeny.mode}
          onChange={(_, v) => { if (v) onEsemeny('mode', v); }}
          fullWidth
        >
          <ToggleButton value="uj">Új esemény létrehozása</ToggleButton>
          <ToggleButton value="meglevo">Meglévő esemény hozzáadása</ToggleButton>
        </ToggleButtonGroup>

        {esemeny.mode === 'uj' ? (
          <>
            <TextField
              label="Cím"
              fullWidth
              value={esemeny.cim}
              onChange={e => onEsemeny('cim', e.target.value)}
              placeholder="Esemény neve..."
            />

            <RichEditorField
              label="Leírás"
              editorId={`form_${formDraftId}_esemeny`}
              minHeight={400}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Mettől"
                  fullWidth
                  type="datetime-local"
                  value={esemeny.mettol}
                  onChange={e => onEsemeny('mettol', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Meddig"
                  fullWidth
                  type="datetime-local"
                  value={esemeny.meddig}
                  onChange={e => onEsemeny('meddig', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Helyszín"
              fullWidth
              value={esemeny.helyszin}
              onChange={e => onEsemeny('helyszin', e.target.value)}
              placeholder="Esemény helyszíne..."
            />

            <TextField
              label="További információk"
              fullWidth
              multiline
              minRows={2}
              value={esemeny.leiras}
              onChange={e => onEsemeny('leiras', e.target.value)}
              placeholder="További információk..."
            />

            {/* Szín – saját ColorPicker */}
            <Box>
              <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 0.75 }}>
                Szín
              </Typography>
              <ColorPicker
                label={
                  <Box
                    sx={{
                      width: 24, height: 24, borderRadius: '50%',
                      bgcolor: esemeny.szin || 'grey.400',
                      border: '1px solid', borderColor: 'divider',
                    }}
                  />
                }
                title="Esemény színe"
                currentColor={esemeny.szin}
                onSelect={color => onEsemeny('szin', color)}
                onClear={() => onEsemeny('szin', '')}
              />
            </Box>
          </>
        ) : (

          <TextField
            label="Esemény keresése"
            fullWidth
            placeholder="Kezdj gépelni az esemény kereséséhez..."
            helperText="A meglévő eseményekből való keresés backend API-t igényel."
          />
        )}

      </AccordionDetails>
    </Accordion>
  );
}