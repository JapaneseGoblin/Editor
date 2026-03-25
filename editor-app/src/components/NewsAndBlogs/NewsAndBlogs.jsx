import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardModel } from './CardModel';
import { LargeCard, MediumCard, SmallCard } from './Card';
import './CardGrid.css';

const mockData = [
  { id: "1",  title: "Üdvözlünk a Humusz Szövetségnél!",           description: "Ismerd meg a nulla hulladék felé vezető utat és szakmai tevékenységünket.",              type: "hír",  image: "https://humusz.hu/sites/default/files/lead-kepek/humusz_weboldal_fejlec.png",                                                        date: "2026-03-15" },
  { id: "2",  title: "Tudatos kampányaink a közösségi médiában",    description: "Csatlakozz hozzánk a Facebookon is, és értesülj elsőként a legújabb zöld hírekről.",    type: "blog", image: "https://humusz.hu/sites/default/files/lead-kepek/_cover_940x300_facebook-hirdetes_0.png",                                             date: "2026-03-12" },
  { id: "3",  title: "Keresd szakértő csapatunkat",                 description: "Szakmai tanácsadóink segítenek az önkormányzatoknak és cégeknek a zöldülésben.",         type: "hír",  image: "https://humusz.hu/sites/default/files/lead-kepek/csapattars1.png",                                                                    date: "2026-03-10" },
  { id: "4",  title: "Újrahasználati Hősök 2026",                   description: "Pályázatunk keretében keressük azokat, akik példát mutatnak a hulladékmegelőzésben.",    type: "blog", image: "https://humusz.hu/sites/default/files/lead-kepek/mirehu_recycling-heroes-2026.jpg",                                                   date: "2026-03-08" },
  { id: "5",  title: "Élesztő: Közösségi tér és komposztpont",      description: "Látogass el hozzánk, és nézd meg, hogyan működik a városi komposztálás a gyakorlatban.", type: "hír",  image: "https://humusz.hu/sites/default/files/lead-kepek/eleszto.png",                                                                       date: "2026-03-05" },
  { id: "6",  title: "Stop Élelmiszerpazarlás!",                    description: "Praktikus tanácsok, hogyan mentsd meg az ételt és csökkentsd a konyhai szemetet.",       type: "blog", image: "https://humusz.hu/sites/default/files/lead-kepek/etel.png",                                                                          date: "2026-03-02" },
  { id: "7",  title: "Fenntartható étkezés a mindennapokban",        description: "Mire figyeljünk vásárláskor? Tippek a csomagolásmentes életmódhoz.",                    type: "hír",  image: "https://humusz.hu/sites/default/files/lead-kepek/etel_.png",                                                                         date: "2026-02-28" },
  { id: "8",  title: "Vizeink védelme és a műanyagszennyezés",      description: "Hogyan óvhatjuk meg az élővizeinket az egyszer használatos műanyagoktól?",              type: "blog", image: "https://humusz.hu/sites/default/files/lead-kepek/ocean_clenup.png",                                                                   date: "2026-02-24" },
  { id: "9",  title: "Szakmai workshop a komposztálásról",           description: "Sikeresen lezajlott a tavaszi képzésünk, ahol a lakossági megoldásokat mutattuk be.",    type: "hír",  image: "https://humusz.hu/sites/default/files/blog-betekinto-kepek/img_7931-768x576.jpeg",                                                   date: "2026-02-20" },
  { id: "10", title: "Zöld közösségi pillanatok",                    description: "Pillanatképek legutóbbi rendezvényünkről, ahol együtt tettünk a környezetért.",          type: "blog", image: "https://humusz.hu/sites/default/files/blog-betekinto-kepek/487911640_1088316699997505_6974445226572605970_n.jpg",                    date: "2026-02-17" },
  { id: "11", title: "Tavaszi Pucolj-ki Akció",                      description: "Regisztrálj te is az országos szemétszedési kampányunkra!",                               type: "blog", image: "https://humusz.hu/sites/default/files/post-pucolj-ki-1500x1000-humusz.jpg",                                                         date: "2026-03-18" },
  { id: "12", title: "Látogass el a Humusz Házba!",                  description: "Várunk interaktív kiállításunkkal és fenntarthatósági programjainkkal minden hétköznap.", type: "hír",  image: "https://humusz.hu/sites/default/files/lead-kepek/20250625_bn_humuszhaz-48.jpg",                                                    date: "2026-03-17" },
];

class NewsAndBlogs extends Component {
  constructor(props) {
    super(props);
    this.state = { cards: [] };
  }

  componentDidMount() {
    const cards = mockData.map(d =>
      new CardModel(d.id, d.title, d.description, d.type, d.image, d.date)
    );
    this.setState({ cards });
  }

  render() {
    const { cards } = this.state;
    const { navigate } = this.props;

    const largeCard   = cards[0];
    const mediumCards = cards.slice(1, 4);
    const smallCards  = cards.slice(4, 12);

    return (
      <div className="news-page-wrapper">
        <div className="top-layout-grid">
          <div className="medium-column">
            {mediumCards.map(card => (
              <MediumCard key={card.id} model={card} onArticleClick={() => navigate(`/article/${card.id}`)} />
            ))}
          </div>
          <div className="small-column">
            {smallCards.map(card => (
              <SmallCard key={card.id} model={card} onArticleClick={() => navigate(`/article/${card.id}`)} />
            ))}
          </div>
        </div>
        <div className="large-card-row">
          {largeCard && <LargeCard model={largeCard} onArticleClick={() => navigate(`/article/${largeCard.id}`)} />}
        </div>
      </div>
    );
  }
}

function NewsAndBlogsWrapper() {
  const navigate = useNavigate();
  return <NewsAndBlogs navigate={navigate} />;
}

export default NewsAndBlogsWrapper;