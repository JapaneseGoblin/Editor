import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Chip, Button,
  useMediaQuery, useTheme,
} from '@mui/material';

// ── Model ─────────────────────────────────────────────────────

interface CardData {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  date: string;
}

const MOCK_DATA: CardData[] = [
  { id: '1',  title: 'Üdvözlünk a Humusz Szövetségnél!',           description: 'Ismerd meg a nulla hulladék felé vezető utat és szakmai tevékenységünket.',              type: 'hír',  image: 'https://humusz.hu/sites/default/files/lead-kepek/humusz_weboldal_fejlec.png',                                                        date: '2026-03-15' },
  { id: '2',  title: 'Tudatos kampányaink a közösségi médiában',    description: 'Csatlakozz hozzánk a Facebookon is, és értesülj elsőként a legújabb zöld hírekről.',    type: 'blog', image: 'https://humusz.hu/sites/default/files/lead-kepek/_cover_940x300_facebook-hirdetes_0.png',                                             date: '2026-03-12' },
  { id: '3',  title: 'Keresd szakértő csapatunkat',                 description: 'Szakmai tanácsadóink segítenek az önkormányzatoknak és cégeknek a zöldülésben.',         type: 'hír',  image: 'https://humusz.hu/sites/default/files/lead-kepek/csapattars1.png',                                                                    date: '2026-03-10' },
  { id: '4',  title: 'Újrahasználati Hősök 2026',                   description: 'Pályázatunk keretében keressük azokat, akik példát mutatnak a hulladékmegelőzésben.',    type: 'blog', image: 'https://humusz.hu/sites/default/files/lead-kepek/mirehu_recycling-heroes-2026.jpg',                                                   date: '2026-03-08' },
  { id: '5',  title: 'Élesztő: Közösségi tér és komposztpont',      description: 'Látogass el hozzánk, és nézd meg, hogyan működik a városi komposztálás a gyakorlatban.', type: 'hír',  image: 'https://humusz.hu/sites/default/files/lead-kepek/eleszto.png',                                                                       date: '2026-03-05' },
  { id: '6',  title: 'Stop Élelmiszerpazarlás!',                    description: 'Praktikus tanácsok, hogyan mentsd meg az ételt és csökkentsd a konyhai szemetet.',       type: 'blog', image: 'https://humusz.hu/sites/default/files/lead-kepek/etel.png',                                                                          date: '2026-03-02' },
  { id: '7',  title: 'Fenntartható étkezés a mindennapokban',        description: 'Mire figyeljünk vásárláskor? Tippek a csomagolásmentes életmódhoz.',                    type: 'hír',  image: 'https://humusz.hu/sites/default/files/lead-kepek/etel_.png',                                                                         date: '2026-02-28' },
  { id: '8',  title: 'Vizeink védelme és a műanyagszennyezés',      description: 'Hogyan óvhatjuk meg az élővizeinket az egyszer használatos műanyagoktól?',              type: 'blog', image: 'https://humusz.hu/sites/default/files/lead-kepek/ocean_clenup.png',                                                                   date: '2026-02-24' },
  { id: '9',  title: 'Szakmai workshop a komposztálásról',           description: 'Sikeresen lezajlott a tavaszi képzésünk, ahol a lakossági megoldásokat mutattuk be.',    type: 'hír',  image: 'https://humusz.hu/sites/default/files/blog-betekinto-kepek/img_7931-768x576.jpeg',                                                   date: '2026-02-20' },
  { id: '10', title: 'Zöld közösségi pillanatok',                    description: 'Pillanatképek legutóbbi rendezvényünkről, ahol együtt tettünk a környezetért.',          type: 'blog', image: 'https://humusz.hu/sites/default/files/blog-betekinto-kepek/487911640_1088316699997505_6974445226572605970_n.jpg',                    date: '2026-02-17' },
  { id: '11', title: 'Tavaszi Pucolj-ki Akció',                      description: 'Regisztrálj te is az országos szemétszedési kampányunkra!',                               type: 'blog', image: 'https://humusz.hu/sites/default/files/post-pucolj-ki-1500x1000-humusz.jpg',                                                         date: '2026-03-18' },
  { id: '12', title: 'Látogass el a Humusz Házba!',                  description: 'Várunk interaktív kiállításunkkal és fenntarthatósági programjainkkal minden hétköznap.', type: 'hír',  image: 'https://humusz.hu/sites/default/files/lead-kepek/20250625_bn_humuszhaz-48.jpg',                                                    date: '2026-03-17' },
];

// ── Kártya alap komponens ─────────────────────────────────────

interface ArticleCardProps {
  card: CardData;
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
      {/* Overlay */}
      <Box
        className="card-overlay"
        sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.45) 100%)',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Badge */}
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

      {/* Tartalom */}
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

  const largeCard   = MOCK_DATA[0];
  const mediumCards = MOCK_DATA.slice(1, 4);
  const smallCards  = MOCK_DATA.slice(4, 12);

  const go = (id: string) => navigate(`/article/${id}`);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 2 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

          {/* Felső rács: közepes + kis kártyák */}
          <Grid container spacing={1.5}>
            {/* Közepes oszlop */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {mediumCards.map(card => (
                  <ArticleCard key={card.id} card={card} height={isMobile ? 260 : 500} onClick={() => go(card.id)} />
                ))}
              </Box>
            </Grid>

            {/* Kis kártyák rács */}
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

          {/* Nagy kártya alul */}
          <ArticleCard card={largeCard} height={isMobile ? 300 : 420} onClick={() => go(largeCard.id)} />

        </Box>
      </Container>
    </Box>
  );
}