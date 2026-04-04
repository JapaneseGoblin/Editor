import { useCallback, useRef, useState } from 'react';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'openrouter/free';
const API_KEY        = import.meta.env.VITE_OPENROUTER_API_KEY as string;

interface UseAIReturn {
  isLoading: boolean;
  complete: (prompt: string) => Promise<string>;
  rewrite:  (text: string, instruction: string) => Promise<string>;
  abort:    () => void;
}

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const callAI = useCallback(async (messages: { role: string; content: string }[]): Promise<string> => {
    // Új AbortController – ne szakítsa meg az előző kérést automatikusan
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const res = await fetch(OPENROUTER_URL, {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type':  'application/json',
          'HTTP-Referer':  window.location.origin,
        },
        body: JSON.stringify({
          model:       MODEL,
          messages,
          max_tokens:  300,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      if (res.status === 429) throw new Error('Rate limit – kérlek várj egy kicsit és próbáld újra.');
      if (!res.ok) throw new Error(`API hiba: ${res.status}`);

      const data = await res.json() as {
        choices: { message: { content: string } }[];
      };
      return data.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return '';
      console.error('AI hiba:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Szöveg autocomplete – folytatja amit a felhasználó elkezdett
  const complete = useCallback(async (context: string): Promise<string> => {
    return callAI([
      {
        role: 'system',
        content: 'Te egy szövegszerkesztő asszisztens vagy. A felhasználó szövegét kell folytatnod természetesen és tömören. Csak a folytatást add vissza, semmi mást. Ne ismételd meg a megadott szöveget. Maximum 1-2 mondat.',
      },
      {
        role: 'user',
        content: `Folytasd ezt a szöveget: "${context}"`,
      },
    ]);
  }, [callAI]);

  // Kijelölt szöveg átírása utasítás alapján
  const rewrite = useCallback(async (text: string, instruction: string): Promise<string> => {
    return callAI([
      {
        role: 'system',
        content: 'Te egy szövegszerkesztő asszisztens vagy. A felhasználó szövegét kell átírni az utasítás alapján. Csak az átírt szöveget add vissza, semmi mást. Tartsd meg az eredeti nyelvet.',
      },
      {
        role: 'user',
        content: `Utasítás: ${instruction}\n\nSzöveg: "${text}"`,
      },
    ]);
  }, [callAI]);

  return { isLoading, complete, rewrite, abort };
}