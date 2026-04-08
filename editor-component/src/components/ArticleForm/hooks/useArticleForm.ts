import { useState, useCallback, useEffect } from 'react';
import type { ArticleFormData, EsemenyFormData, Rovat } from '../types';
import { editorKey } from '../types';

const EMPTY_ESEMENY: EsemenyFormData = {
  mode:     'uj',
  cim:      '',
  leiras:   '',
  mettol:   '',
  meddig:   '',
  helyszin: '',
  szin:     '#1565c0',
};

const INITIAL_STATE: ArticleFormData = {
  cim:               '',
  kepFile:           null,
  kepPreview:        null,
  rovat:             '',
  bevezeto:          '',
  blogRovat:         '',
  tematika:          [],
  celcsoport:        '',
  mufaj:             '',
  szerzo:            '',
  forras:            '',
  esemeny:           EMPTY_ESEMENY,
  idozitett:         false,
  publikalasIdopont: '',
  meddigKapcsolo:    false,
  publikalasVege:    '',
};

function createDraftId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseArticleFormReturn {
  form:          ArticleFormData;
  formDraftId:   string;
  isDirty:       boolean;
  setField:      <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => void;
  setEsemeny:    <K extends keyof EsemenyFormData>(key: K, value: EsemenyFormData[K]) => void;
  setKep:        (file: File | null) => void;
  handleSubmit:  (piszkozat: boolean) => void;
  resetForm:     () => void;
}

export function useArticleForm(initialData?: Partial<ArticleFormData>, initialDraftId?: string): UseArticleFormReturn {
  const [form, setForm] = useState<ArticleFormData>({
    ...INITIAL_STATE,
    ...initialData,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [formDraftId] = useState<string>(initialDraftId ?? createDraftId);

  useEffect(() => {
    return () => {
      localStorage.removeItem(editorKey(formDraftId, 'cikk'));
      localStorage.removeItem(editorKey(formDraftId, 'leiras'));
    };
  }, [formDraftId]);

  const setField = useCallback(
    <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    [],
  );

  const setEsemeny = useCallback(
    <K extends keyof EsemenyFormData>(key: K, value: EsemenyFormData[K]) => {
      setForm(prev => ({
        ...prev,
        esemeny: { ...prev.esemeny, [key]: value },
      }));
      setIsDirty(true);
    },
    [],
  );

  const setKep = useCallback((file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, kepFile: file, kepPreview: preview }));
    } else {
      setForm(prev => ({ ...prev, kepFile: null, kepPreview: null }));
    }
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback((piszkozat: boolean) => {
    const cikkContent   = localStorage.getItem(editorKey(formDraftId, 'cikk'))   ?? null;
    const leirasContent = localStorage.getItem(editorKey(formDraftId, 'leiras')) ?? null;
    const payload = { ...form, piszkozat, cikkContent, leirasContent };
    console.log('📤 Form beküldve:', payload);
    alert(piszkozat ? 'Piszkozat mentve! (konzol)' : 'Publikálva! (konzol)');
  }, [form, formDraftId]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_STATE);
    setIsDirty(false);
  }, []);

  return { form, formDraftId, isDirty, setField, setEsemeny, setKep, handleSubmit, resetForm };
}

export function useRovatChange(setField: UseArticleFormReturn['setField']) {
  return useCallback((rovat: Rovat) => {
    setField('rovat', rovat);
    setField('bevezeto', '');
    setField('blogRovat', '');
    setField('tematika', []);
    setField('celcsoport', '');
    setField('mufaj', '');
    setField('szerzo', '');
    setField('forras', '');
  }, [setField]);
}