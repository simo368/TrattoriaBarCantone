import { useState } from 'react';

export default function ChiSiamo() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  
  const gallery = [
    { src: '/img/hero.jpg', label: 'La sala' },
    { src: '/img/gallery-tortelli.jpg', label: 'Tortelli verdi' },
    { src: '/img/gallery-gnocco.jpg', label: 'Gnocco fritto' },
    { src: '/img/gallery-sala.jpg', label: "L'ambiente" },
    { src: '/img/gallery-dolci.jpg', label: 'Dolci della casa' }
  ];

  return (
    <main style={{ paddingTop: '76px' }}>
      {/* CHI SIAMO */}
      <section className="section about">
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

      {/* GALLERIA */}
      <section className="section gallery-section">
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
    </main>
  );
}
