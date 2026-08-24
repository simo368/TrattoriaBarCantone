import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ChiSiamo() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  
  const gallery = [
    { src: './img/hero.jpg', label: 'La sala' },
    { src: './img/gallery-tortelli.jpg', label: 'Tortelli verdi' },
    { src: './img/gallery-gnocco.jpg', label: 'Gnocco fritto' },
    { src: './img/gallery-sala.jpg', label: "L'ambiente" },
    { src: './img/gallery-dolci.jpg', label: 'Dolci della casa' }
  ];

  // Gestione tastiera per Lightbox
  const handleKeyDown = useCallback((e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowRight') setCurrentImg((i) => (i + 1) % gallery.length);
    if (e.key === 'ArrowLeft') setCurrentImg((i) => (i - 1 + gallery.length) % gallery.length);
  }, [lightboxOpen, gallery.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Previene lo scroll quando la lightbox è aperta
  useEffect(() => {
    if (lightboxOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  return (
    <main className="about-page" style={{ paddingBottom: 0 }}>
      {/* 1. HERO EDITORIALE */}
      <section className="section" style={{ padding: '160px 0 80px', backgroundColor: 'var(--c-crema)' }}>
        <div className="container center">
          <span className="eyebrow" style={{ color: 'var(--c-gold)', marginBottom: '24px' }}>Chi Siamo</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 10vw, 5.5rem)', lineHeight: 1, marginBottom: '32px' }}>
            La tradizione, <br/>
            <em>senza moda.</em>
          </h1>
          <p className="section-lead" style={{ fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto', color: 'var(--c-forest-light)' }}>
            Tra Carpi e Correggio, un luogo dove la cucina emiliana si esprime con sincerità e il tempo sembra essersi fermato.
          </p>
        </div>
      </section>

      {/* 2/3. FOTOGRAFIA GRANDE & STORIA */}
      <section className="section" style={{ padding: '0 0 120px' }}>
        <div className="container">
          <img 
            src="./img/gallery-sala.jpg" 
            alt="L'ambiente rustico della trattoria" 
            loading="lazy"
            style={{ width: '100%', height: '70vh', objectFit: 'cover', marginBottom: '80px' }}
            onError={(e) => { e.target.src = './img/hero.jpg'; }} // fallback
          />
          
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--c-forest)', marginBottom: '32px' }}>
              L'ambiente rustico, gli strumenti agricoli appesi alle pareti e la nostra veranda raccontano un modo di stare a tavola genuino e senza fronzoli. 
            </p>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--c-forest)' }}>
              Siamo orgogliosi di preparare ancora la pasta fresca a mano ogni giorno. Tortelli verdi, tortellini, gnocco fritto, salumi selezionati e dolci fatti in casa: <strong>sapori sinceri, porzioni generose.</strong>
            </p>
            <div style={{ marginTop: '60px', fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--c-terra)', fontStyle: 'italic' }}>
              Come una volta, con il cuore.
            </div>
          </div>
        </div>
      </section>

      {/* 4. I QUATTRO VALORI */}
      <section className="section" style={{ backgroundColor: 'var(--c-forest)', color: '#fff', padding: '120px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', textAlign: 'center' }}>
            
            <div style={{ padding: '24px' }}>
              <span style={{ display: 'block', fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--c-terra)', marginBottom: '16px' }}>01</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>Pasta Fresca</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Lavorata a mano ogni giorno sul nostro asse di legno.</p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <span style={{ display: 'block', fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--c-terra)', marginBottom: '16px' }}>02</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>Ricette Emiliane</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>La vera tradizione della nostra terra, senza compromessi.</p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <span style={{ display: 'block', fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--c-terra)', marginBottom: '16px' }}>03</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>Ambiente Rustico</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Familiare, autentico, vissuto. Sentiti a casa.</p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <span style={{ display: 'block', fontSize: '3rem', fontFamily: 'var(--font-serif)', color: 'var(--c-terra)', marginBottom: '16px' }}>04</span>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>Tavoli all'Aperto</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Un'accoglienza informale sotto il cielo della campagna.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. GALLERIA FOTOGRAFICA */}
      <section className="section" style={{ padding: '120px 0', backgroundColor: 'var(--c-crema)' }}>
        <div className="container">
          <div className="center" style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '3.5rem' }}>La Nostra Atmosfera</h2>
          </div>
          
          {/* Stile Masonry Naturale - CSS Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px', 
            gridAutoRows: '300px' 
          }}>
            {gallery.map((img, i) => {
              // Creiamo un layout asimmetrico: la prima foto prende 2 righe/colonne se c'è spazio
              const isLarge = i === 0; 
              return (
                <button 
                  key={i} 
                  onClick={() => { setCurrentImg(i); setLightboxOpen(true); }}
                  aria-label={`Ingrandisci immagine: ${img.label}`}
                  style={{ 
                    border: 'none', 
                    padding: 0, 
                    background: 'none', 
                    cursor: 'pointer',
                    gridColumn: isLarge ? '1 / -1' : 'auto', // Su schermi ampi, possiamo renderla grande. Qui usiamo full width per la prima.
                    gridRow: isLarge ? 'span 2' : 'span 1',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="gallery-item"
                >
                  <img 
                    src={img.src} 
                    alt={img.label}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                    onError={(e) => { e.target.src = './img/hero.jpg'; }}
                  />
                  <div className="gallery-overlay" style={{
                    position: 'absolute', inset: 0, 
                    display: 'flex', alignItems: 'flex-end', padding: '24px',
                    color: '#fff', fontSize: '1.2rem', fontFamily: 'var(--font-sans)', fontWeight: 500
                  }}>
                    {img.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CTA PRENOTAZIONE */}
      <section className="section" style={{ backgroundColor: 'var(--c-terra)', color: '#fff', textAlign: 'center', padding: '160px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, marginBottom: '48px' }}>
            Vieni a <br/><em>trovarci.</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '20px 48px', borderWidth: '2px' }}>
            Prenota un tavolo
          </Link>
        </div>
      </section>

      {/* LIGHTBOX MIGLIORATO ED ACCESSIBILE */}
      {lightboxOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Galleria immagini"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(26,36,33,0.98)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: lightboxOpen ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Chiusura */}
          <button 
            aria-label="Chiudi galleria"
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px', zIndex: 10 }}
            onClick={() => setLightboxOpen(false)}
            autoFocus
          >
            <X size={36} />
          </button>

          {/* Navigazione */}
          <button 
            aria-label="Immagine precedente"
            style={{ position: 'absolute', left: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '24px', zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i - 1 + gallery.length) % gallery.length); }}
          >
            <ChevronLeft size={48} />
          </button>

          <button 
            aria-label="Immagine successiva"
            style={{ position: 'absolute', right: '24px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '24px', zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i + 1) % gallery.length); }}
          >
            <ChevronRight size={48} />
          </button>

          {/* Immagine */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }}>
            <img 
              src={gallery[currentImg].src} 
              alt={gallery[currentImg].label} 
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
              onError={(e) => { e.target.src = './img/hero.jpg'; }}
            />
            <div style={{ position: 'absolute', bottom: '-40px', left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: '1rem', opacity: 0.7 }}>
              {gallery[currentImg].label} — {currentImg + 1} / {gallery.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
