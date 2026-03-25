import { useCallback, useRef, useState, useEffect } from 'react';

function formatTime(date) {
  return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export function useAutoSave(editor, articleId) {
  const storageKey  = `rte_content_${articleId}`;
  const saveTimerRef = useRef(null);
  const [lastSaved,  setLastSaved]  = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const autoSave = useCallback((ed) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ed.getJSON()));
      setLastSaved(new Date());
      setSaveStatus('saved');
    } catch (_) {
      setSaveStatus('error');
    }
  }, [storageKey]);

  const scheduleSave = useCallback((ed) => {
    clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(() => autoSave(ed), 1000);
  }, [autoSave]);

  const saveNow = useCallback(() => {
    if (!editor) return;
    clearTimeout(saveTimerRef.current);
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

  const importJSON = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        editor.commands.setContent(JSON.parse(evt.target.result));
        setLastSaved(null);
        setSaveStatus('idle');
      } catch (_) {
        alert('Érvénytelen JSON fájl.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [editor]);

  const statusLabel = saveStatus === 'saving' ? 'Mentés...'
    : saveStatus === 'error'  ? 'Mentési hiba!'
    : lastSaved               ? `Mentve: ${formatTime(lastSaved)}`
    : 'Nincs mentve';

  return { saveStatus, statusLabel, scheduleSave, saveNow, exportJSON, importJSON };
}