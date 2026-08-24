import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { settingsStore, menuStore } from '../utils/localStore';

export default function Home() {
  const settings = settingsStore.get();
  const rawMenu = menuStore.getAll();
  const [activeTab, setActiveTab] = useState('antipasti');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  const categories = ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];
  
  // Temporary placeholders for images since we are completely local
  const gallery = [
    { src: '/img/hero.jpg', label: 'La sala' },
    { src: '/img/gallery-tortelli.jpg', label: 'Tortelli verdi' },
    { src: '/img/gallery-gnocco.jpg', label: 'Gnocco fritto' },
    { src: '/img/gallery-sala.jpg', label: "L'ambiente" },
    { src: '/img/gallery-dolci.jpg', label: 'Dolci della casa' }
  ];

  return (
    <main id="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <img src="/img/hero.jpg" alt="Sala interna della Trattoria Bar Cantone" />
        </div>
        <div className="container">
          <div className="hero-copy">
            <div className="eyebrow">Carpi · Cantone di Gargallo</div>
            <h1>Il sapore vero<em>della tradizione emiliana</em></h1>
            <p className="hero-lead">Pasta fresca fatta a mano, gnocco fritto e piatti della nostra terra, in un ambiente semplice e familiare.</p>
            <div className="hero-actions">
              <Link to="/prenota" className="btn btn-primary">📅 Prenota online</Link>
              <a href="#menu" className="btn btn-ghost">Guarda il menù</a>
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
            <div className="info-icon">🕒</div>
            <div>
              <span className="info-label">Orari</span>
              <span className="info-value">Aperti oggi</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div>
              <span className="info-label">Indirizzo</span>
              <span className="info-value"><a href={settings.maps} target="_blank" rel="noreferrer">Via Fornaci 36, Carpi</a></span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">🍝</div>
            <div>
              <span className="info-label">Cucina</span>
              <span className="info-value">Tradizionale emiliana</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📞</div>
            <div>
              <span className="info-label">Contatti</span>
              <span className="info-value"><a href={settings.phoneLink}>{settings.phone}</a></span>
            </div>
          </div>
        </div>
      </div>

      {/* CHI SIAMO */}
      <section id="chi-siamo" className="section about">
        <div className="container split">
          <div className="img-frame">
            <img src="/img/gallery-sala.jpg" alt="Sala rustica" />
          </div>
          <div className="about-copy">
            <div className="eyebrow">Chi siamo</div>
            <h2>Qui la tradizione<br/>non è una moda</h2>
            <p>Tra Carpi e Correggio, la Trattoria Bar Cantone è un luogo dove la cucina emiliana si esprime con semplicità: pasta fresca lavorata a mano, ricette della tradizione e un'accoglienza informale.</p>
            <p>L'ambiente rustico, gli strumenti agricoli e la veranda raccontano un modo di stare a tavola genuino e senza fronzoli. Tortelli verdi, tortellini, tagliatelle, gnocco fritto, salumi selezionati e dolci fatti in casa: sapori sinceri, porzioni generose.</p>
            <p className="signature">Come una volta, con il cuore.</p>
            <div className="pillars">
              <div className="pillar"><strong>✦ Pasta fresca</strong><span>Lavorata a mano ogni giorno</span></div>
              <div className="pillar"><strong>✦ Ricette emiliane</strong><span>Tradizione senza compromessi</span></div>
              <div className="pillar"><strong>✦ Ambiente rustico</strong><span>Familiare, autentico, vissuto</span></div>
              <div className="pillar"><strong>✦ Tavoli all'aperto</strong><span>Accoglienza informale</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section id="menu" className="section menu-section">
        <div className="container">
          <div className="eyebrow center">La nostra cucina</div>
          <h2 className="center">Il menù della tradizione</h2>
          <p className="section-lead center">Pochi piatti, scelti con cura. Il meglio della cucina emiliana, in tavola ogni giorno.</p>
          
          <div className="menu-fixed-box">
            <div>
              <span className="menu-fixed-label">Pranzo · giorni feriali</span>
              <span className="menu-fixed-name">Menù fisso completo</span>
            </div>
            <div className="menu-fixed-price">15 €</div>
          </div>

          <div className="menu-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`menu-tab ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="dishes-grid">
            {rawMenu.filter(m => m.category === activeTab).sort((a,b) => a.order - b.order).map(dish => (
              <article key={dish.id} className="dish-card">
                <h3 className="dish-name">{dish.name}</h3>
                <p className="dish-desc">{dish.desc}</p>
                {dish.price && <div className="dish-price">{dish.price} €</div>}
              </article>
            ))}
          </div>
          
          <p className="menu-note">Il menù può variare in base alla disponibilità degli ingredienti stagionali.</p>
          <div className="center" style={{marginTop: 32}}>
            <Link to="/prenota" className="btn btn-primary">📅 Prenota un tavolo</Link>
          </div>
        </div>
      </section>

      {/* GALLERIA */}
      <section id="galleria" className="section gallery-section">
        <div className="container">
          <div className="eyebrow center">Uno sguardo dentro</div>
          <h2 className="center">La nostra atmosfera</h2>
          <div className="gallery-grid">
            {gallery.map((img, i) => (
              <div key={i} className="gallery-item" onClick={() => { setCurrentImg(i); setLightboxOpen(true); }}>
                <img src={img.src} alt={img.label} />
                <div className="gallery-overlay">{img.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="lightbox open" onClick={() => setLightboxOpen(false)}>
          <button className="lb-btn lb-close" onClick={() => setLightboxOpen(false)}>×</button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i - 1 + gallery.length) % gallery.length); }}>‹</button>
          <img src={gallery[currentImg].src} className="lb-img" alt="" onClick={e => e.stopPropagation()} />
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i + 1) % gallery.length); }}>›</button>
          <div className="lb-counter">{currentImg + 1} / {gallery.length}</div>
        </div>
      )}

      {/* CONTATTI E MAPPA */}
      <section id="contatti" className="section contact-section">
        <div className="container contact-grid">
          <div>
            <div className="eyebrow">Dove siamo</div>
            <h2>Il tavolo è pronto</h2>
            <p style={{marginTop: 12, color: 'var(--muted)'}}>
              <strong>{settings.address.street}</strong><br/>
              {settings.address.zip} {settings.address.city} ({settings.address.province})
            </p>
            <a href={settings.phoneLink} className="contact-phone-link">📞 {settings.phone}</a>
            
            <h3 className="hours-title">Orari</h3>
            <table className="hours-table">
              <tbody>
                <tr><td>Lun – Sab</td><td>12:00 – 15:00<br/>19:00 – 23:00</td></tr>
                <tr><td>Domenica</td><td>12:00 – 15:00</td></tr>
              </tbody>
            </table>
            
            <div className="social-row">
              <a href={settings.social.instagram} className="social-link">Instagram</a>
              <a href={settings.social.facebook} className="social-link">Facebook</a>
            </div>
          </div>
          <div>
            <iframe className="map-frame" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2840.7!2d10.8878!3d44.7815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4780254f65a2b5b1%3A0x3af8eba32b01b1a9!2sTrattoria%20Bar%20Cantone!5e0!3m2!1sit!2sit!4v1" title="Mappa" loading="lazy" />
            <div className="cta-box">
              <h3>Prenota il tuo tavolo</h3>
              <p>Assicurati il tuo posto per gustare la vera cucina emiliana. La prenotazione online è veloce e immediata.</p>
              <Link to="/prenota" className="btn btn-primary btn-full">📅 Prenota Subito Online</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
