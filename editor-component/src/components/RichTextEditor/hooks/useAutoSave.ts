import { useCallback, useRef, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  statusLabel: string;
  errorMsg: string;
  scheduleSave: (editor: Editor) => void;
  saveNow: () => void;
  exportJSON: () => void;
  importJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export function useAutoSave(editor: Editor | null, articleId: string | number): UseAutoSaveReturn {
  const storageKey   = `rte_content_${articleId}`;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved,   setLastSaved]   = useState<Date | null>(null);
  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>('idle');
  const [errorMsg,    setErrorMsg]    = useState<string>('Mentési hiba!');

  useEffect(() => () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
  }, []);

  const autoSave = useCallback((ed: Editor) => {
    try {
      const json = JSON.stringify(ed.getJSON());
      
      if (json.length > 4 * 1024 * 1024) {
        console.warn('Tartalom közel van a tárolási limithez:', Math.round(json.length / 1024), 'KB');
      }
      localStorage.setItem(storageKey, json);
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (err) {
      console.error('Mentési hiba:', err);

      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setErrorMsg('A tár megtelt! Töröljön képeket vagy exportálja a tartalmat.');
        setSaveStatus('error');
      } else {
        setErrorMsg('Mentési hiba!');
        setSaveStatus('error');
      }
    }
  }, [storageKey]);

  const scheduleSave = useCallback((ed: Editor) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => autoSave(ed), 1000);
  }, [autoSave]);

  const saveNow = useCallback(() => {
    if (!editor) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    autoSave(editor);
  }, [editor, autoSave]);

  const exportJSON = useCallback(() => {
    if (!editor) return;
    const blob = new Blob([JSON.stringify(editor.getJSON(), null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `cikk_${articleId}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor, articleId]);

  const importJSON = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        editor.commands.setContent(JSON.parse(evt.target?.result as string));
        setLastSaved(null);
        setSaveStatus('idle');
      } catch {
        alert('Érvénytelen JSON fájl.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [editor]);

  const statusLabel =
    saveStatus === 'saving' ? 'Mentés...'
    : saveStatus === 'error'  ? errorMsg
    : lastSaved               ? `Mentve: ${formatTime(lastSaved)}`
    : 'Nincs mentve';

  return { saveStatus, statusLabel, errorMsg, scheduleSave, saveNow, exportJSON, importJSON };
}