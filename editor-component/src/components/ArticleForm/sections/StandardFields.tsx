import { Card, CardContent, TextField } from '@mui/material';
import RichEditorField from '../components/RichEditorField';
import type { Rovat } from '../types';

interface StandardFieldsProps {
  formDraftId: string;
  rovat:       Rovat;
  bevezeto:    string;
  forras:      string;
  onBevezeto:  (v: string) => void;
  onForras:    (v: string) => void;
}

export default function StandardFields({
  formDraftId, rovat, bevezeto, forras,
  onBevezeto, onForras,
}: StandardFieldsProps) {
  const isKulso = rovat === 'kulso';

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Bevezető */}
        <TextField
          label="Bevezető"
          fullWidth
          multiline
          minRows={2}
          maxRows={5}
          value={bevezeto}
          onChange={e => onBevezeto(e.target.value)}
          placeholder="Rövid bevezető szöveg..."
        />

        {/* Forrás – csak Külső híreknél */}
        {isKulso && (
          <TextField
            label="Forrás"
            fullWidth
            value={forras}
            onChange={e => onForras(e.target.value)}
            placeholder="Forrás webcíme..."
          />
        )}

        {/* Cikk – saját szerkesztő */}
        <RichEditorField
          label="Cikk"
          editorId={`form_${formDraftId}_cikk`}
          minHeight={600}
        />

      </CardContent>
    </Card>
  );
}