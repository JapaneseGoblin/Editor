import article_2 from './articles/rte_content_1.json';

const SEED_VERSION = 3;
const SEED_VERSION_KEY = 'humusz_seed_version';

function makeDoc(title: string, paragraphs: string[]) {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }],
      },
      ...paragraphs.map(text => ({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })),
    ],
  };
}

const articles = [
  { id: '1', content: makeDoc('Üdvözlünk a Humusz Szövetségnél!', [
    'A Humusz Szövetség Magyarország vezető nulla hulladék szervezete. 1994 óta dolgozunk azon, hogy a hulladékmegelőzés és az újrahasználat a mindennapi élet részévé váljon.',
    'Szakmai programjaink, kampányaink és közösségi tevékenységünk révén több ezer embert értünk el az elmúlt évtizedekben. Hisszük, hogy a fenntartható jövő nem utópia – hanem tudatos döntések sorozata.',
    'Csatlakozz te is mozgalmunkhoz! Látogass el hozzánk, vegyél részt programjainkon, vagy támogasd munkánkat önkéntesként.',
  ])},
  { id: '2', content: article_2 },
  { id: '3', content: makeDoc('Keresd szakértő csapatunkat', [
    'A Humusz Szövetség szakértői csapata évtizedes tapasztalattal segíti az önkormányzatokat, vállalkozásokat és intézményeket a fenntartható működés felé vezető úton.',
    'Szolgáltatásaink között szerepel hulladékgazdálkodási tanácsadás, környezeti nevelési programok tervezése, zöld közbeszerzési útmutatók és szervezeti fenntarthatósági auditok elvégzése.',
    'Vedd fel velünk a kapcsolatot, és közösen megtaláljuk a legjobb megoldást a te szervezeted számára!',
  ])},
  { id: '4', content: makeDoc('Újrahasználati Hősök 2026', [
    'Pályázatunk célja, hogy láthatóvá tegye azokat az egyéneket, közösségeket és vállalkozásokat, akik kiemelkedő példát mutatnak a hulladékmegelőzés és újrahasználat területén.',
    'Az idei évben különösen várjuk a textil újrahasználattal, a közösségi cseretermekkel és az élelmiszer-mentéssel foglalkozó kezdeményezések pályázatait.',
    'A pályázat benyújtásának határideje: 2026. május 15. A nyerteseket júniusban hirdetjük ki egy különleges eseményen.',
  ])},
  { id: '5', content: makeDoc('Élesztő: Közösségi tér és komposztpont', [
    'Az Élesztő egy egyedülálló közösségi tér Budapesten, ahol a városi komposztálás és a fenntartható életmód kéz a kézben jár. Nálunk leadhatod a szerves hulladékod, és cserébe komposztot vihetsz haza.',
    'A tér minden héten tart nyílt napokat, ahol kézműves workshopokat, csereburzákat és tematikus előadásokat kínálunk. A belépés ingyenes.',
    'Nyitvatartás: hétfőtől péntekig 10–18 óra, szombaton 9–13 óra. Cím: Budapest, VIII. kerület.',
  ])},
  { id: '6', content: makeDoc('Stop Élelmiszerpazarlás!', [
    'Magyarországon évente több mint egymillió tonna élelmiszer kerül a szemétbe – ezzel párhuzamosan sok család küzd azzal, hogy elegendő ételt tegyen az asztalra.',
    'Kampányunk keretében tippeket adunk a tudatos bevásárláshoz, az ételmaradékok kreatív felhasználásához és a leghatékonyabb tartósítási módszerekhez.',
    'Töltsd le ingyenes útmutatónkat a weblapunkról, és csatlakozz a #StopElelmiszerPazarlas mozgalomhoz!',
  ])},
  { id: '7', content: makeDoc('Fenntartható étkezés a mindennapokban', [
    'A csomagolásmentes életmód nem jelent lemondást – épp ellenkezőleg, tudatosabb és sokszor gazdaságosabb fogyasztást tesz lehetővé.',
    'Első lépés: saját bevásárló táskák és tartályok. Második: heti étlap tervezése a pazarlás minimalizálásáért. Harmadik: helyi termelők és piacok felkeresése.',
    'Kövess minket, és hetente megosztjuk legjobb tippjeinket a fenntartható étkezésről.',
  ])},
  { id: '8', content: makeDoc('Vizeink védelme és a műanyagszennyezés', [
    'A Föld édesvízkészleteinek mindössze 3%-a hozzáférhető az emberiség számára, mégis évente millió tonna műanyaghulladék kerül a folyókba és tavakba.',
    'A Humusz Szövetség rendszeres folyóparti és tóparti szemétszedési akciókat szervez, és aktívan lobbizik a betétdíjas rendszer kiterjesztéséért.',
    'Te is megteheted a különbséget: kerüld az egyszer használatos műanyagokat, és csatlakozz következő akciónkhoz!',
  ])},
  { id: '9', content: makeDoc('Szakmai workshop a komposztálásról', [
    'Tavaszi workshopsorozatunk első állomása a komposztálás volt – és nagy sikerrel zárult! Közel 80 résztvevő sajátította el az otthoni és közösségi komposztálás alapjait.',
    'A képzésen szó esett a megfelelő arányokról, a leggyakoribb hibákról, a gilisztakomposztálásról és a bokashi módszerről.',
    'A következő workshop időpontja: 2026. április 22. (Föld Napja). Regisztráció a weblapunkon – helyek száma korlátozott!',
  ])},
  { id: '10', content: makeDoc('Zöld közösségi pillanatok', [
    'Legutóbbi rendezvényünkön több mint 200 lelkes résztvevő gyűlt össze, hogy együtt tegyenek valamit a zöldebb jövőért.',
    'Különösen szívmelengető volt látni a sok fiatal arcot – a következő generáció egyre tudatosabban áll a környezeti kérdésekhez.',
    'Nézd meg a galériánkat a weblapunkon, és iratkozz fel hírlevelünkre, hogy ne maradj le a következő eseményről!',
  ])},
  { id: '11', content: makeDoc('Tavaszi Pucolj-ki Akció', [
    'Április 5-én indul az idei Pucolj-ki Akció, Magyarország legnagyobb koordinált szemétszedési kampánya!',
    'A részvétel egyszerű: regisztrálj a weboldalunkon, jelezd melyik helyszínen szeretnél részt venni, és mi biztosítjuk az eszközöket.',
    'Az akció célja nem csak a szemét összeszedése, hanem a szemléletformálás is. Hozd el a családod, barátaidat!',
  ])},
  { id: '12', content: makeDoc('Látogass el a Humusz Házba!', [
    'A Humusz Ház interaktív kiállítóterünk és fenntarthatósági központunk egyszerre. Minden hétköznap várunk érdeklődőket.',
    'A kiállítás bemutatja a hulladék életútját a keletkezéstől az újrahasznosításig. A belépés ingyenes.',
    'Csoportos látogatáshoz előzetes bejelentkezés szükséges. Iskolai foglalkozásokat és szülinapi programokat is szervezünk!',
  ])},
  { id: '13', content: makeDoc('Nulla Hulladék Tanösvény – ingyenes program', [
    'A Nulla Hulladék Tanösvény ingyenes, interaktív szabadtéri oktatási program 11-12. osztályos diákok számára.',
    'A program 4 állomásból áll, kb. 2 órát vesz igénybe, és csapatmunkát igénylő feladatokat tartalmaz.',
    'Jelentkezés: legkésőbb az indulás előtt 2 héttel a weblapunkon elérhető formanyomtatványon keresztül.',
  ])},
  { id: '14', content: makeDoc('240 milliárd forint láthatatlan kukákra', [
    'Az MKKP elemzése szerint a MOHU működésével kapcsolatban súlyos kérdések merülnek fel a köz pénzének felhasználásával kapcsolatban.',
    'A kritika középpontjában az áll, hogy az átvett hulladékgazdálkodási feladatok elvégzése nem éri el azt a minőségi szintet, amelyet a kifizetett összegek indokolnának.',
    'A Humusz Szövetség kiáll a transzparens hulladékgazdálkodás mellett, és követeli a közpénzek elszámoltathatóságát.',
  ])},
  { id: '15', content: makeDoc('Műanyagpolitika mint biztonságpolitika', [
    'Kevesen gondolnak bele, hogy az európai műanyagipar és az orosz fosszilis energia között szoros gazdasági kötelékek állnak fenn.',
    'Ez a függőség biztonsági kockázatot jelent: egy geopolitikai konfliktus esetén az európai csomagoló- és műanyagipar akadozni kezdhet.',
    'A Humusz Szövetség szerint a műanyagmentesség nemcsak környezeti, hanem stratégiai energiafüggetlenségi kérdés is.',
  ])},
];

export function seedArticles(): void {
  const currentVersion = Number(localStorage.getItem(SEED_VERSION_KEY) ?? 0);

  const forceOverwrite = currentVersion < SEED_VERSION;

  articles.forEach(({ id, content }) => {
    const key = `rte_content_${id}`;
    if (forceOverwrite || !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(content));
    }
  });

  localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
}