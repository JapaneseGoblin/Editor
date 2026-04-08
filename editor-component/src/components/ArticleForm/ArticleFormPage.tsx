import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useArticleForm, useRovatChange } from './hooks/useArticleForm';
import type { ArticleFormData } from './types';
import { editorKey } from './types';

import BasicFields      from './sections/BasicFields';
import BlogFields       from './sections/BlogFields';
import StandardFields   from './sections/StandardFields';
import ForumFields      from './sections/ForumFields';
import ArticleSettings  from './sections/ArticleSettings';
import EventAccordion   from './sections/EventAccordion';
import PublishAccordion from './sections/PublishAccordion';
import ActionBar        from './components/ActionBar';
import PreviewDialog    from './components/PreviewDialog';

import { MOCK_ARTICLES } from '../../data/mockArticles';

export default function ArticleFormPage() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const existingArticle = useMemo(
    () => (id ? MOCK_ARTICLES.find(a => a.id === id) : undefined),
    [id],
  );

  const initialData = useMemo((): Partial<ArticleFormData> | undefined => {
    if (!existingArticle) return undefined;
    return {
      cim:        existingArticle.title,
      kepPreview: existingArticle.image,
      rovat:      existingArticle.rovat,
      bevezeto:   existingArticle.bevezeto   ?? '',
      tematika:   existingArticle.tematika   ?? [],
      celcsoport: existingArticle.celcsoport ?? '',
      mufaj:      existingArticle.mufaj      ?? '',
      blogRovat:  existingArticle.blogRovat  ?? '',
      szerzo:     existingArticle.szerzo     ?? '',
      forras:     existingArticle.forras     ?? '',
    };
  }, [existingArticle]);

  // formDraftId-t egyszer generáljuk, lazy useState-tel (pure init)
  const [formDraftId] = useState<string>(
    () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );

  // Seed tartalmát szinkron másoljuk a form draft kulcsra – még az editor mount előtt
  useMemo(() => {
    if (!id) return;
    const seedContent = localStorage.getItem(`rte_content_${id}`);
    if (!seedContent) return;
    const formKey = editorKey(formDraftId, 'cikk');
    localStorage.setItem(formKey, seedContent);
  }, [id, formDraftId]);

  const { form, setField, setEsemeny, setKep, handleSubmit } = useArticleForm(initialData, formDraftId);
  const handleRovatChange = useRovatChange(setField);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { rovat } = form;
  const isBlog      = rovat === 'blog';
  const isForum     = rovat === 'forum';
  const isStandard  = ['humusz', 'szakmai', 'kulso'].includes(rovat);
  const showBottom  = rovat !== '';

  const pageTitle = existingArticle
    ? `Szerkesztés: ${existingArticle.title}`
    : 'Új cikk létrehozása';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 20,
        bgcolor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider',
        px: 2, py: 1,
        display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Vissza
        </Button>
        <Typography variant="h6" fontWeight={500} fontSize={16}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pageTitle}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 1, sm: 2 }, py: 3 }}>
        <BasicFields
          cim={form.cim}
          szerzo={form.szerzo}
          kepPreview={form.kepPreview}
          rovat={rovat}
          onCimChange={v => setField('cim', v)}
          onSzerzoChange={v => setField('szerzo', v)}
          onKepChange={setKep}
          onRovatChange={handleRovatChange}
        />

        {isBlog && (
          <BlogFields
            formDraftId={formDraftId}
            bevezeto={form.bevezeto}
            blogRovat={form.blogRovat}
            tematika={form.tematika}
            onBevezeto={v => setField('bevezeto', v)}
            onBlogRovat={v => setField('blogRovat', v)}
            onTematika={v => setField('tematika', v)}
          />
        )}

        {isStandard && (
          <>
            <StandardFields
              formDraftId={formDraftId}
              rovat={rovat}
              bevezeto={form.bevezeto}
              forras={form.forras}
              onBevezeto={v => setField('bevezeto', v)}
              onForras={v => setField('forras', v)}
            />
            <ArticleSettings
              tematika={form.tematika}
              celcsoport={form.celcsoport}
              mufaj={form.mufaj}
              onTematika={v => setField('tematika', v)}
              onCelcsoport={v => setField('celcsoport', v)}
              onMufaj={v => setField('mufaj', v)}
            />
          </>
        )}

        {isForum && (
          <ForumFields
            formDraftId={formDraftId}
            forras={form.forras}
            onForras={v => setField('forras', v)}
          />
        )}

        {showBottom && (
          <>
            <EventAccordion esemeny={form.esemeny} formDraftId={formDraftId} onEsemeny={setEsemeny} />
            <PublishAccordion
              idozitett={form.idozitett}
              publikalasIdopont={form.publikalasIdopont}
              meddigKapcsolo={form.meddigKapcsolo}
              publikalasVege={form.publikalasVege}
              onIdozitett={v => setField('idozitett', v)}
              onIdopont={v => setField('publikalasIdopont', v)}
              onMeddigKapcsolo={v => setField('meddigKapcsolo', v)}
              onPublikalasVege={v => setField('publikalasVege', v)}
            />
            <ActionBar
              onSaveDraft={() => handleSubmit(true)}
              onPublish={() => handleSubmit(false)}
              onPreview={() => setPreviewOpen(true)}
            />
            <PreviewDialog
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              formDraftId={formDraftId}
              articleId={id}
              meta={{
                cim:        form.cim,
                szerzo:     form.szerzo,
                rovat:      form.rovat,
                tematika:   form.tematika,
                celcsoport: form.celcsoport,
                mufaj:      form.mufaj,
                forras:     form.forras,
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
}