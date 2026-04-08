import { Card, CardContent, TextField } from '@mui/material';
import RichEditorField from '../components/RichEditorField';

interface ForumFieldsProps {
  formDraftId: string;
  forras:      string;
  onForras:    (v: string) => void;
}

export default function ForumFields({ formDraftId, forras, onForras }: ForumFieldsProps) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        <TextField
          label="Forrás (webcím)"
          fullWidth
          type="url"
          value={forras}
          onChange={e => onForras(e.target.value)}
          placeholder="https://..."
        />

        <RichEditorField
          label="Leírás"
          editorId={`form_${formDraftId}_leiras`}
          minHeight={400}
        />

      </CardContent>
    </Card>
  );
}
