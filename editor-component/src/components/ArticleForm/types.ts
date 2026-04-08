export type Rovat = '' | 'blog' | 'humusz' | 'szakmai' | 'kulso' | 'forum';

export const ROVAT_LABELS: Record<Exclude<Rovat, ''>, string> = {
  blog:    'Blog',
  humusz:  'Humusz hírek',
  szakmai: 'Szakmai cikkek',
  kulso:   'Külső hírek',
  forum:   'Fölösleges áruk fóruma',
};

export const BLOG_ROVATOK = [
  '– Nincs –', 'Szépségápolás', 'Redizájn', 'Beszámoló',
  'Baba-mama', 'Életmód', 'Háztartás', 'Konyha', 'Ajánló',
];

export const TEMATIKA_OPTIONS = [
  'Megelőzés', 'Műanyag', 'Újrahasználat', 'Újrahasznosítás',
  'Szelektív gyűjtés', 'Komposztálás', 'Fogyasztóvédelem',
  'Hulladékégetés', 'Hulladéklerakás', 'Klímaváltozás',
  'Felnőttképzés', 'Gyermekoktatás', 'Szakpolitika',
  'Illegális hulladéklerakás', 'Betétdíj', 'Szemétdíj',
  'Hálózatépítés', 'Közösségek', 'Programok', 'Angol', 'Francia',
  'Saláta – programajánló', 'Saláta – oktatási segédletek',
  'Saláta – pályázatok', 'Saláta – táborok',
  'Saláta – vetélkedők', 'Saláta – egyéb', 'Kiadványok',
];

export const CELCSOPORT_OPTIONS = [
  'Civilek', 'Kormányzat', 'Lakosság', 'Önkormányzatok',
  'Pedagógusok', 'Szolgáltatók', 'Tudomány', 'Újságírók', 'Vállalkozók',
];

export const MUFAJ_OPTIONS = [
  '– Nincs –', 'hirdetés', 'közlemény', 'ajánló', 'felhívás',
  'hír', 'interjú', 'jegyzet', 'riport', 'sajtófigyelő', 'vélemény',
];

export interface EsemenyFormData {
  mode:     'uj' | 'meglevo';
  cim:      string;
  leiras:   string;
  mettol:   string;
  meddig:   string;
  helyszin: string;
  szin:     string;
}

export interface ArticleFormData {
  cim:              string;
  kepFile:          File | null;
  kepPreview:       string | null;
  rovat:            Rovat;
  // Blog + Standard rovatok
  bevezeto:         string;
  // Blog only
  blogRovat:        string;
  tematika:         string[];
  // Standard rovatok (Cikk részletei)
  celcsoport:       string;
  mufaj:            string;
  // Külső hírek + Fólum
  szerzo:           string;
  forras:           string;
  // Esemény
  esemeny:          EsemenyFormData;
  // Publikálás
  idozitett:         boolean;
  publikalasIdopont: string;
  meddigKapcsolo:    boolean;
  publikalasVege:    string;
}

/** Az egyes TipTap editor mezők localStorage kulcsait generálja */
export function editorKey(formDraftId: string, field: 'cikk' | 'leiras'): string {
  return `rte_content_form_${formDraftId}_${field}`;
}

/** Melyik rovat esetén kell Bevezető mező */
export function hasBevezeto(rovat: Rovat): boolean {
  return ['blog', 'humusz', 'szakmai', 'kulso'].includes(rovat);
}

/** Melyik rovat esetén kell Cikk részletei accordion */
export function hasArticleSettings(rovat: Rovat): boolean {
  return ['humusz', 'szakmai', 'kulso'].includes(rovat);
}