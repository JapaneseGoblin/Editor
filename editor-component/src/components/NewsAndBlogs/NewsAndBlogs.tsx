import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Chip, Button,
  useMediaQuery, useTheme,
} from '@mui/material';
import { MOCK_ARTICLES } from '../../data/mockArticles';
import type { ArticleData } from '../../data/mockArticles';

// ── Kártya alap komponens ─────────────────────────────────────

interface ArticleCardProps {
  card: ArticleData;
  height: number;
  onClick: () => void;
}

function ArticleCard({ card, height, onClick }: ArticleCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        height,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: `url(${card.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        bgcolor: 'grey.800',
        boxShadow: 3,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 6,
          '& .card-overlay': { opacity: 0.85 },
          '& .card-btn': { borderColor: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.12)' },
        },
      }}
    >
      <Box
        className="card-overlay"
        sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.45) 100%)',
          transition: 'opacity 0.3s',
        }}
      />
      <Chip
        label={card.type.toUpperCase()}
        size="small"
        sx={{
          position: 'absolute', top: 16, right: 16, zIndex: 2,
          color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)',
          bgcolor: 'transparent', backdropFilter: 'blur(6px)',
          fontWeight: 700, fontSize: 11,
        }}
      />
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, zIndex: 2 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.75, lineHeight: 1.25 }}>
          {card.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mb: 1.5, fontSize: 13 }}>
          {card.description}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block' }}>
          {new Date(card.date).toLocaleDateString('hu-HU')}
        </Typography>
        <Button
          className="card-btn"
          size="small"
          variant="outlined"
          sx={{
            position: 'absolute', bottom: 20, right: 20,
            color: '#fff', borderColor: 'rgba(255,255,255,0.5)',
            fontWeight: 700, fontSize: 11,
            transition: 'all 0.25s',
          }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          Olvasd el
        </Button>
      </Box>
    </Box>
  );
}

// ── Fő oldal ──────────────────────────────────────────────────

export default function NewsAndBlogs() {
  const navigate = useNavigate();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const largeCard   = MOCK_ARTICLES[0];
  const mediumCards = MOCK_ARTICLES.slice(1, 4);
  const smallCards  = MOCK_ARTICLES.slice(4, 12);

  const go = (id: string) => navigate(`/article/${id}`);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 2 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {mediumCards.map(card => (
                  <ArticleCard key={card.id} card={card} height={isMobile ? 260 : 500} onClick={() => go(card.id)} />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Grid container spacing={1.5}>
                {smallCards.map(card => (
                  <Grid key={card.id} size={{ xs: 6, sm: isTablet ? 4 : 6 }}>
                    <ArticleCard card={card} height={isMobile ? 180 : 240} onClick={() => go(card.id)} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
          <ArticleCard card={largeCard} height={isMobile ? 300 : 420} onClick={() => go(largeCard.id)} />
        </Box>
      </Container>
    </Box>
  );
}