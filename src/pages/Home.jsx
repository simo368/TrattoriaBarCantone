import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { Clock, MapPin, Utensils, Phone } from 'lucide-react';

export default function Home() {
  const { settings } = useSettings();

  return (
    <main id="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="./img/hero.jpg" alt="Sala interna della Trattoria Bar Cantone" />
        </div>
        <div className="container">
          <div className="hero-copy">
            <div className="eyebrow">Carpi · Cantone di Gargallo</div>
            <h1>Il sapore vero<em>della tradizione emiliana</em></h1>
            <p className="hero-lead">Pasta fresca fatta a mano, gnocco fritto e piatti della nostra terra, in un ambiente semplice e familiare.</p>
            <div className="hero-actions">
              <Link to="/prenota" className="btn btn-primary">Prenota online</Link>
              <Link to="/menu" className="btn btn-ghost">Guarda il menù</Link>
            </div>
            <div className="hero-proof">
              <span className="hero-stars">★★★★☆</span>
              <strong style={{color:'var(--gold)'}}>4,3/5</strong>
              <span>1.760+ recensioni Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      <div className="info-bar">
        <div className="container info-bar-grid">
          <div className="info-item">
            <div className="info-icon"><Clock size={20} /></div>
            <div>
              <span className="info-label">Orari</span>
              <span className="info-value open">Aperti oggi</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><MapPin size={20} /></div>
            <div>
              <span className="info-label">Indirizzo</span>
              <span className="info-value"><a href={settings.maps} target="_blank" rel="noreferrer">Via Fornaci 36, Carpi</a></span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><Utensils size={20} /></div>
            <div>
              <span className="info-label">Cucina</span>
              <span className="info-value">Tradizionale emiliana</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon"><Phone size={20} /></div>
            <div>
              <span className="info-label">Contatti</span>
              <span className="info-value"><a href={settings.phoneLink}>{settings.phone}</a></span>
            </div>
          </div>
        </div>
      </div>

      {/* BREVE INTRO E RECENSIONI IN HOME (Semplificato) */}
      <section className="section about" style={{ paddingBottom: '60px' }}>
        <div className="container center">
          <div className="eyebrow">Trattoria Bar Cantone</div>
          <h2 style={{ maxWidth: '600px', margin: '16px auto' }}>L'autentica ospitalità della campagna modenese</h2>
          <p className="section-lead">
            Da noi troverai sempre un sorriso, un bicchiere di Lambrusco e i piatti veri della tradizione.
            Siamo orgogliosi di offrire un'esperienza semplice ma ricca di gusto.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
             <Link to="/chi-siamo" className="btn btn-outline">Scopri la Trattoria</Link>
             <Link to="/contatti" className="btn btn-outline">Come raggiungerci</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
