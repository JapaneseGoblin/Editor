import type { Rovat } from '../components/ArticleForm/types';

export interface ArticleData {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  date: string;
  rovat: Rovat;
  bevezeto?: string;
  tematika?: string[];
  celcsoport?: string;
  mufaj?: string;
  blogRovat?: string;
  szerzo?: string;
  forras?: string;
}

export const MOCK_ARTICLES: ArticleData[] = [
  {
    id: '1', type: 'hír', date: '2026-03-15',
    title: 'Üdvözlünk a Humusz Szövetségnél!',
    description: 'Ismerd meg a nulla hulladék felé vezető utat és szakmai tevékenységünket.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/humusz_weboldal_fejlec.png',
    rovat: 'humusz',
    bevezeto: 'A Humusz Szövetség Magyarország vezető nulla hulladék szervezete, amely 1994 óta dolgozik a hulladékmegelőzés és újrahasználat elterjesztéséért.',
    tematika: ['Megelőzés', 'Újrahasználat', 'Hálózatépítés'],
    celcsoport: 'Lakosság',
    mufaj: 'közlemény',
  },
  {
    id: '2', type: 'blog', date: '2026-03-12',
    title: 'Tudatos kampányaink a közösségi médiában',
    description: 'Csatlakozz hozzánk a Facebookon is, és értesülj elsőként a legújabb zöld hírekről.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/_cover_940x300_facebook-hirdetes_0.png',
    rovat: 'blog',
    bevezeto: 'Közösségi médiás kampányaink célja, hogy minél több embert érjünk el a fenntartható életmód üzenetével.',
    blogRovat: 'Életmód',
    tematika: ['Megelőzés', 'Közösségek'],
  },
  {
    id: '3', type: 'hír', date: '2026-03-10',
    title: 'Keresd szakértő csapatunkat',
    description: 'Szakmai tanácsadóink segítenek az önkormányzatoknak és cégeknek a zöldülésben.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/csapattars1.png',
    rovat: 'humusz',
    bevezeto: 'Több mint 30 éves tapasztalattal segítjük a szervezeteket a fenntartható működés kialakításában.',
    tematika: ['Szakpolitika', 'Megelőzés'],
    celcsoport: 'Önkormányzatok',
    mufaj: 'ajánló',
  },
  {
    id: '4', type: 'blog', date: '2026-03-08',
    title: 'Újrahasználati Hősök 2026',
    description: 'Pályázatunk keretében keressük azokat, akik példát mutatnak a hulladékmegelőzésben.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/mirehu_recycling-heroes-2026.jpg',
    rovat: 'blog',
    bevezeto: 'Az Újrahasználati Hősök pályázat immár negyedik éve keresi a kiemelkedő fenntarthatósági példákat.',
    blogRovat: 'Ajánló',
    tematika: ['Újrahasználat', 'Közösségek', 'Programok'],
  },
  {
    id: '5', type: 'hír', date: '2026-03-05',
    title: 'Élesztő: Közösségi tér és komposztpont',
    description: 'Látogass el hozzánk, és nézd meg, hogyan működik a városi komposztálás a gyakorlatban.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/eleszto.png',
    rovat: 'humusz',
    bevezeto: 'Az Élesztő közösségi tér egyedülálló helyszín, ahol a komposztálás és a közösség találkozik.',
    tematika: ['Komposztálás', 'Közösségek'],
    celcsoport: 'Lakosság',
    mufaj: 'hír',
  },
  {
    id: '6', type: 'blog', date: '2026-03-02',
    title: 'Stop Élelmiszerpazarlás!',
    description: 'Praktikus tanácsok, hogyan mentsd meg az ételt és csökkentsd a konyhai szemetet.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/etel.png',
    rovat: 'blog',
    bevezeto: 'Évente egymillió tonna élelmiszer kerül a szemétbe Magyarországon – ez megállítható.',
    blogRovat: 'Konyha',
    tematika: ['Megelőzés', 'Fogyasztóvédelem'],
  },
  {
    id: '7', type: 'hír', date: '2026-02-28',
    title: 'Fenntartható étkezés a mindennapokban',
    description: 'Mire figyeljünk vásárláskor? Tippek a csomagolásmentes életmódhoz.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/etel_.png',
    rovat: 'humusz',
    bevezeto: 'A csomagolásmentes bevásárlás egyszerűbb, mint gondolnád – mutatjuk, hogyan kezdj bele.',
    tematika: ['Megelőzés', 'Műanyag'],
    celcsoport: 'Lakosság',
    mufaj: 'ajánló',
  },
  {
    id: '8', type: 'blog', date: '2026-02-24',
    title: 'Vizeink védelme és a műanyagszennyezés',
    description: 'Hogyan óvhatjuk meg az élővizeinket az egyszer használatos műanyagoktól?',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/ocean_clenup.png',
    rovat: 'blog',
    bevezeto: 'A műanyagszennyezés az egyik legsúlyosabb környezeti probléma, amellyel vizeink szembesülnek.',
    blogRovat: 'Életmód',
    tematika: ['Műanyag', 'Megelőzés', 'Klímaváltozás'],
  },
  {
    id: '9', type: 'hír', date: '2026-02-20',
    title: 'Szakmai workshop a komposztálásról',
    description: 'Sikeresen lezajlott a tavaszi képzésünk, ahol a lakossági megoldásokat mutattuk be.',
    image: 'https://humusz.hu/sites/default/files/blog-betekinto-kepek/img_7931-768x576.jpeg',
    rovat: 'humusz',
    bevezeto: 'Tavaszi workshopsorozatunk első állomása a komposztálás volt – közel 80 résztvevővel.',
    tematika: ['Komposztálás', 'Felnőttképzés'],
    celcsoport: 'Civilek',
    mufaj: 'beszámoló',
  },
  {
    id: '10', type: 'blog', date: '2026-02-17',
    title: 'Zöld közösségi pillanatok',
    description: 'Pillanatképek legutóbbi rendezvényünkről, ahol együtt tettünk a környezetért.',
    image: 'https://humusz.hu/sites/default/files/blog-betekinto-kepek/487911640_1088316699997505_6974445226572605970_n.jpg',
    rovat: 'blog',
    bevezeto: 'Legutóbbi rendezvényünkön több mint 200 lelkes résztvevő gyűlt össze a zöldebb jövőért.',
    blogRovat: 'Beszámoló',
    tematika: ['Közösségek', 'Programok'],
  },
  {
    id: '11', type: 'program', date: '2026-03-18',
    title: 'Tavaszi Pucolj-ki Akció',
    description: 'Regisztrálj te is az országos szemétszedési kampányunkra!',
    image: 'https://humusz.hu/sites/default/files/post-pucolj-ki-1500x1000-humusz.jpg',
    rovat: 'humusz',
    bevezeto: 'Április 5-én indul az idei Pucolj-ki Akció – csatlakozz te is!',
    tematika: ['Megelőzés', 'Közösségek', 'Programok'],
    celcsoport: 'Lakosság',
    mufaj: 'felhívás',
  },
  {
    id: '12', type: 'hír', date: '2026-03-17',
    title: 'Látogass el a Humusz Házba!',
    description: 'Várunk interaktív kiállításunkkal és fenntarthatósági programjainkkal minden hétköznap.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/20250625_bn_humuszhaz-48.jpg',
    rovat: 'humusz',
    bevezeto: 'A Humusz Ház interaktív kiállítóterünk és fenntarthatósági központunk – minden hétköznap nyitva.',
    tematika: ['Gyermekoktatás', 'Közösségek'],
    celcsoport: 'Pedagógusok',
    mufaj: 'ajánló',
  },
  {
    id: '13', type: 'program', date: '2026-03-16',
    title: 'Nulla Hulladék Tanösvény – ingyenes program',
    description: 'Csoportokat vár a Nulla Hulladék Tanösvény – ingyenes program 11-12. osztályosoknak.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/humusz_weboldal_fejlec.png',
    rovat: 'humusz',
    bevezeto: 'Ingyenes, interaktív szabadtéri oktatási program 11-12. osztályos diákok számára.',
    tematika: ['Gyermekoktatás', 'Megelőzés', 'Újrahasznosítás'],
    celcsoport: 'Pedagógusok',
    mufaj: 'felhívás',
  },
  {
    id: '14', type: 'hír', date: '2026-03-14',
    title: '240 milliárd forint láthatatlan kukákra',
    description: 'Az MKKP éles kritikája a MOHU tevékenységéről és a hulladékgazdálkodás helyzetéről.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/csapattars1.png',
    rovat: 'kulso',
    bevezeto: 'Az MKKP elemzése súlyos kérdéseket vet fel a MOHU közpénzfelhasználásával kapcsolatban.',
    tematika: ['Szakpolitika', 'Szelektív gyűjtés'],
    celcsoport: 'Újságírók',
    mufaj: 'sajtófigyelő',
    forras: 'MKKP elemzés, 2026',
  },
  {
    id: '15', type: 'hír', date: '2026-03-13',
    title: 'Műanyagpolitika mint biztonságpolitika',
    description: 'Az orosz fosszilis energia és az európai műanyaggyártás rejtett kapcsolata.',
    image: 'https://humusz.hu/sites/default/files/lead-kepek/ocean_clenup.png',
    rovat: 'szakmai',
    bevezeto: 'Az európai műanyagipar és az orosz fosszilis energia között szoros gazdasági kötelékek állnak fenn.',
    tematika: ['Műanyag', 'Szakpolitika', 'Klímaváltozás'],
    celcsoport: 'Tudomány',
    mufaj: 'vélemény',
  },
];