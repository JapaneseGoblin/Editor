import { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, TextField, FormControlLabel, Switch,
  Collapse, Box, ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import ExpandMoreIcon       from '@mui/icons-material/ExpandMore';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';

interface PublishAccordionProps {
  idozitett:         boolean;
  publikalasIdopont: string;
  meddigKapcsolo:    boolean;
  publikalasVege:    string;
  onIdozitett:       (v: boolean) => void;
  onIdopont:         (v: string) => void;
  onMeddigKapcsolo:  (v: boolean) => void;
  onPublikalasVege:  (v: string) => void;
}

const IDOTARTAMOK = [
  { label: '1 hét',   napok: 7  },
  { label: '2 hét',   napok: 14 },
  { label: '3 hét',   napok: 21 },
  { label: '1 hónap', napok: 30 },
  { label: '3 hónap', napok: 90 },
];

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function alapDatum(mikortol: string): Date {
  return mikortol ? new Date(mikortol) : new Date();
}

export default function PublishAccordion({
  idozitett, publikalasIdopont, meddigKapcsolo, publikalasVege,
  onIdozitett, onIdopont, onMeddigKapcsolo, onPublikalasVege,
}: PublishAccordionProps) {
  const [open, setOpen] = useState(false);
  const [kivalasztottNapok, setKivalasztottNapok] = useState<number | null>(null);

  const hasValues = idozitett || meddigKapcsolo;

  function handleIdotartam(napok: number) {
    const alap = alapDatum(publikalasIdopont);
    alap.setDate(alap.getDate() + napok);
    onPublikalasVege(toDatetimeLocal(alap));
    setKivalasztottNapok(napok);
  }

  function handleMeddigKezzel(v: string) {
    onPublikalasVege(v);
    setKivalasztottNapok(null); // kézi szerkesztésnél töröljük a gyors kiválasztást
  }

  function handleMeddigToggle(bekapcsolva: boolean) {
    onMeddigKapcsolo(bekapcsolva);
    if (!bekapcsolva) {
      onPublikalasVege('');
      setKivalasztottNapok(null);
    }
  }

  return (
    <Accordion
      expanded={open}
      onChange={(_, v) => setOpen(v)}
      variant="outlined"
      sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <ScheduleOutlinedIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
        <Typography fontWeight={500}>Publikálás</Typography>
        {hasValues && !open && (
          <Typography variant="caption" color="primary.main" sx={{ ml: 1.5, alignSelf: 'center' }}>
            {[idozitett && 'Időzített', meddigKapcsolo && 'Lejárat beállítva'].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>

        {/* ── MIKORTÓL ──────────────────────────────────── */}
        <FormControlLabel
          control={<Switch checked={idozitett} onChange={e => onIdozitett(e.target.checked)} />}
          label="Időzített publikálás (mikortól)"
        />

        <Collapse in={idozitett} unmountOnExit>
          <TextField
            label="Mikortól legyen látható"
            fullWidth
            type="datetime-local"
            value={publikalasIdopont}
            onChange={e => onIdopont(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Collapse>

        <Divider />

        {/* ── MEDDIG ────────────────────────────────────── */}
        <FormControlLabel
          control={<Switch checked={meddigKapcsolo} onChange={e => handleMeddigToggle(e.target.checked)} />}
          label="Lejárati dátum (meddig)"
        />

        <Collapse in={meddigKapcsolo} unmountOnExit>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block' }}>
                Gyors beállítás {publikalasIdopont ? '(a mikortól dátumtól számítva)' : '(mostantól számítva)'}
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={kivalasztottNapok}
                onChange={(_, v) => { if (v !== null) handleIdotartam(v); }}
                sx={{ flexWrap: 'wrap', gap: 0.5 }}
              >
                {IDOTARTAMOK.map(({ label, napok }) => (
                  <ToggleButton key={napok} value={napok} sx={{ px: 1.5, py: 0.5, fontSize: 13 }}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <TextField
              label="Meddig legyen látható"
              fullWidth
              type="datetime-local"
              value={publikalasVege}
              onChange={e => handleMeddigKezzel(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={
                kivalasztottNapok
                  ? `${IDOTARTAMOK.find(i => i.napok === kivalasztottNapok)?.label} – kézzel is módosítható`
                  : undefined
              }
            />

          </Box>
        </Collapse>

      </AccordionDetails>
    </Accordion>
  );
}