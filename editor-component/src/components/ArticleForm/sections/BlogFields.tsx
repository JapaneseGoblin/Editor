import {
  Card, CardContent, TextField,
  FormControl, InputLabel, Select, MenuItem,
  Autocomplete, Chip,
} from '@mui/material';
import RichEditorField from '../components/RichEditorField';
import { BLOG_ROVATOK, TEMATIKA_OPTIONS } from '../types';

interface BlogFieldsProps {
  formDraftId: string;
  bevezeto:    string;
  blogRovat:   string;
  tematika:    string[];
  onBevezeto:  (v: string) => void;
  onBlogRovat: (v: string) => void;
  onTematika:  (v: string[]) => void;
}

export default function BlogFields({
  formDraftId, bevezeto, blogRovat, tematika,
  onBevezeto, onBlogRovat, onTematika,
}: BlogFieldsProps) {
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

        <RichEditorField
          label="Cikk"
          editorId={`form_${formDraftId}_cikk`}
          minHeight={600}
        />

        <FormControl fullWidth>
          <InputLabel>Blog rovat</InputLabel>
          <Select
            label="Blog rovat"
            value={blogRovat}
            onChange={e => onBlogRovat(e.target.value)}
          >
            {BLOG_ROVATOK.map(r => (
              <MenuItem key={r} value={r === '– Nincs –' ? '' : r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

      </CardContent>
    </Card>
  );
}
