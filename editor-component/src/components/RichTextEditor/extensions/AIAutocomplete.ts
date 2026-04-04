import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const AUTOCOMPLETE_KEY = new PluginKey('aiAutocomplete');
const DEBOUNCE_MS = 4000; // ms várakozás gépelés után (rate limit miatt)
let autocompleteEnabled = false; // alapból kikapcsolva

export function setAutocompleteEnabled(val: boolean) {
  autocompleteEnabled = val;
}

// Ghost text dekoráció (halvány szöveg az aktuális pozíció után)
function createGhostDecoration(pos: number, text: string) {
  const el = document.createElement('span');
  el.textContent = text;
  el.style.cssText = 'color: #9ca3af; pointer-events: none; user-select: none;';
  return Decoration.widget(pos, el, { side: 1, key: 'ghost' });
}

interface AutocompleteState {
  suggestion: string;
  decorations: DecorationSet;
}

export function createAIAutocompleteExtension(
  onComplete: (context: string) => Promise<string>
) {
  return Extension.create({
    name: 'aiAutocomplete',

    addProseMirrorPlugins() {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let currentSuggestion = '';

      return [
        new Plugin({
          key: AUTOCOMPLETE_KEY,

          state: {
            init: (): AutocompleteState => ({ suggestion: '', decorations: DecorationSet.empty }),
            apply(tr, prev): AutocompleteState {
              // Töröljük a javaslatot ha a felhasználó ír valamit
              if (tr.docChanged && !tr.getMeta('acceptSuggestion')) {
                return { suggestion: '', decorations: DecorationSet.empty };
              }
              return {
                suggestion: prev.suggestion,
                decorations: prev.decorations.map(tr.mapping, tr.doc),
              };
            },
          },

          props: {
            decorations(state) {
              return AUTOCOMPLETE_KEY.getState(state)?.decorations ?? DecorationSet.empty;
            },

            handleKeyDown(view, event) {
              const pluginState = AUTOCOMPLETE_KEY.getState(view.state) as AutocompleteState;

              // Tab – elfogadja a javaslatot
              if (event.key === 'Tab' && pluginState.suggestion) {
                event.preventDefault();
                const { tr } = view.state;
                const pos = view.state.selection.from;
                tr.insertText(pluginState.suggestion, pos);
                tr.setMeta('acceptSuggestion', true);
                view.dispatch(tr);
                currentSuggestion = '';
                return true;
              }

              // Escape – elveti a javaslatot
              if (event.key === 'Escape' && pluginState.suggestion) {
                const { tr } = view.state;
                tr.setMeta('clearSuggestion', true);
                view.dispatch(tr);
                currentSuggestion = '';
                return true;
              }

              return false;
            },
          },

          view() {
            return {
              update(view) {
                if (!autocompleteEnabled) return;
                const { selection, doc } = view.state;

                // Csak ha a kurzor szöveg végén van (nem kijelölés)
                if (selection.from !== selection.to) return;

                const pos  = selection.from;
                const text = doc.textBetween(Math.max(0, pos - 200), pos, '\n');

                // Ne indítsunk kérést ha túl rövid a szöveg
                if (text.trim().length < 50) return; // Minimum 50 karakter kell az autocomplete-hez

                // Debounce
                if (timer) clearTimeout(timer);
                timer = setTimeout(async () => {
                  try {
                    const suggestion = await onComplete(text);
                    if (!suggestion || suggestion === currentSuggestion) return;
                    currentSuggestion = suggestion;

                    // Ghost text dekoráció hozzáadása
                    const curPos = view.state.selection.from;
                    const deco   = createGhostDecoration(curPos, suggestion);
                    const { tr } = view.state;
                    tr.setMeta(AUTOCOMPLETE_KEY, {
                      suggestion,
                      decorations: DecorationSet.create(view.state.doc, [deco]),
                    });
                    view.dispatch(tr);
                  } catch {
                    // Hiba esetén csendben maradunk
                  }
                }, DEBOUNCE_MS);
              },
              destroy() {
                if (timer) clearTimeout(timer);
              },
            };
          },

          // State apply kiegészítés a Meta kezeléséhez
        }),
      ];
    },
  });
}