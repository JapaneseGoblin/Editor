import { useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box, Typography, TextField, InputAdornment,
  Chip, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import type { ArticleData } from '../../../data/mockArticles';

export interface ArticlePickerHandle {
  focusSearch: () => void;
}

interface ArticlePickerProps {
  articles: ArticleData[];
  usedArticleIds: Set<string>;
  onSelect: (article: ArticleData) => void;
}

const TYPE_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  hír:     'primary',
  blog:    'success',
  program: 'warning',
};

const ArticlePicker = forwardRef<ArticlePickerHandle, ArticlePickerProps>(
  ({ articles, usedArticleIds, onSelect }, ref) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    }));

    const filtered = useMemo(() => {
      const q = query.toLowerCase().trim();
      if (!q) return articles;
      return articles.filter(a =>
        a.title.toLowerCase().includes(q) || a.type.toLowerCase().includes(q)
      );
    }, [articles, query]);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1.5, flexShrink: 0 }}>
          <Typography fontWeight={700} fontSize="0.9rem" mb={1.25}>Cikkek</Typography>
          <TextField
            inputRef={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Keresés..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.85rem' } }}
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1 }}>
          {filtered.length === 0 && (
            <Typography variant="caption" color="text.disabled"
              sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              Nincs találat
            </Typography>
          )}
          {filtered.map(article => {
            const alreadyUsed = usedArticleIds.has(article.id);
            return (
              <Box
                key={article.id}
                onClick={() => onSelect(article)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.25,
                  p: 1, borderRadius: 2, cursor: 'pointer',
                  opacity: alreadyUsed ? 0.5 : 1,
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{
                  width: 44, height: 44, borderRadius: 1.5, flexShrink: 0,
                  backgroundImage: `url(${article.image})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  bgcolor: 'grey.200',
                }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontSize="0.8rem" fontWeight={600} lineHeight={1.3} sx={{
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {article.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                    <Chip
                      label={article.type}
                      size="small"
                      color={TYPE_COLORS[article.type] ?? 'default'}
                      sx={{ height: 16, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                    <Typography fontSize="0.68rem" color="text.disabled">
                      {new Date(article.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
                <AddCircleOutlineIcon sx={{
                  fontSize: 18,
                  color: alreadyUsed ? 'text.disabled' : 'primary.main',
                  flexShrink: 0,
                }} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }
);

ArticlePicker.displayName = 'ArticlePicker';
export default ArticlePicker;