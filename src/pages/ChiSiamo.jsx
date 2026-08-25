import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';

export default function ChiSiamo() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  
  const { images, loading } = useGallery();
  const activeImages = images ? images.filter(img => img.active) : [];
  
  const gallery = (!loading && activeImages.length > 0) 
    ? activeImages.map(img => ({ src: img.url, label: img.title || '' }))
    : [
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
    <main className="about-page pb-0">
      {/* 1. HERO EDITORIALE */}
      <section className="section bg-crema pt-xxl pb-xl">
        <div className="container center">
          <span className="eyebrow text-gold mb-4">Chi Siamo</span>
          <h1 className="hero-title text-forest mb-4">
            La tradizione, <br/>
            <em>senza moda.</em>
          </h1>
          <p className="section-lead text-forest-light max-w-md mx-auto text-lead">
            Tra Carpi e Correggio, un luogo dove la cucina emiliana si esprime con sincerità e il tempo sembra essersi fermato.
          </p>
        </div>
      </section>

      {/* 2/3. FOTOGRAFIA GRANDE & STORIA */}
      <section className="section pb-xl pt-0">
        <div className="container">
          <img 
            src="./img/gallery-sala.jpg" 
            alt="L'ambiente rustico della trattoria" 
            loading="lazy"
            className="w-full h-70vh object-cover mb-xl"
            onError={(e) => { e.target.src = './img/hero.jpg'; }} // fallback
          />
          
          <div className="max-w-md mx-auto text-center">
            <p className="text-lead text-forest mb-4">
              L'ambiente rustico, gli strumenti agricoli appesi alle pareti e la nostra veranda raccontano un modo di stare a tavola genuino e senza fronzoli. 
            </p>
            <p className="text-lead text-forest">
              Siamo orgogliosi di preparare ancora la pasta fresca a mano ogni giorno. Tortelli verdi, tortellini, gnocco fritto, salumi selezionati e dolci fatti in casa: <strong>sapori sinceri, porzioni generose.</strong>
            </p>
            <div className="mt-xl title-md text-terra italic">
              Come una volta, con il cuore.
            </div>
          </div>
        </div>
      </section>

      {/* 4. I QUATTRO VALORI */}
      <section className="section bg-forest text-white py-xl">
        <div className="container">
          <div className="grid-4cols text-center gap-xl">
            
            <div className="p-4">
              <span className="block title-lg text-terra mb-3">01</span>
              <h3 className="title-md text-white mb-3">Pasta Fresca</h3>
              <p className="text-white-70">Lavorata a mano ogni giorno sul nostro asse di legno.</p>
            </div>
            
            <div className="p-4">
              <span className="block title-lg text-terra mb-3">02</span>
              <h3 className="title-md text-white mb-3">Ricette Emiliane</h3>
              <p className="text-white-70">La vera tradizione della nostra terra, senza compromessi.</p>
            </div>
            
            <div className="p-4">
              <span className="block title-lg text-terra mb-3">03</span>
              <h3 className="title-md text-white mb-3">Ambiente Rustico</h3>
              <p className="text-white-70">Familiare, autentico, vissuto. Sentiti a casa.</p>
            </div>
            
            <div className="p-4">
              <span className="block title-lg text-terra mb-3">04</span>
              <h3 className="title-md text-white mb-3">Tavoli all'Aperto</h3>
              <p className="text-white-70">Un'accoglienza informale sotto il cielo della campagna.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. GALLERIA FOTOGRAFICA */}
      <section className="section py-xl bg-crema">
        <div className="container">
          <div className="center mb-xl">
            <h2 className="title-xl">La Nostra Atmosfera</h2>
          </div>
          
          <div className="gallery-grid-3cols">
            {gallery.map((img, i) => {
              const isLarge = i === 0; 
              return (
                <button 
                  key={i} 
                  onClick={() => { setCurrentImg(i); setLightboxOpen(true); }}
                  aria-label={`Ingrandisci immagine: ${img.label}`}
                  className="gallery-item-btn gallery-item"
                  style={{ 
                    gridColumn: isLarge ? '1 / -1' : 'auto',
                    gridRow: isLarge ? 'span 2' : 'span 1'
                  }}
                >
                  <img 
                    src={img.src} 
                    alt={img.label}
                    loading="lazy"
                    className="gallery-img-full"
                    onError={(e) => { e.target.src = './img/hero.jpg'; }}
                  />
                  <div className="gallery-overlay">
                    {img.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CTA PRENOTAZIONE */}
      <section className="section bg-terra text-white text-center py-xxl">
        <div className="container">
          <h2 className="title-mega text-white mb-xl">
            Vieni a <br/><em>trovarci.</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost btn-xl border-2">
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
          className="lightbox-overlay"
          style={{ opacity: lightboxOpen ? 1 : 0 }}
          onClick={() => setLightboxOpen(false)}
        >
          {/* Chiusura */}
          <button 
            aria-label="Chiudi galleria"
            className="lightbox-close"
            onClick={() => setLightboxOpen(false)}
            autoFocus
          >
            <X size={36} />
          </button>

          {/* Navigazione */}
          <button 
            aria-label="Immagine precedente"
            className="lightbox-prev"
            onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i - 1 + gallery.length) % gallery.length); }}
          >
            <ChevronLeft size={48} />
          </button>

          <button 
            aria-label="Immagine successiva"
            className="lightbox-next"
            onClick={(e) => { e.stopPropagation(); setCurrentImg((i) => (i + 1) % gallery.length); }}
          >
            <ChevronRight size={48} />
          </button>

          {/* Immagine */}
          <div onClick={(e) => e.stopPropagation()} className="lightbox-content">
            <img 
              src={gallery[currentImg].src} 
              alt={gallery[currentImg].label} 
              className="lightbox-img"
              onError={(e) => { e.target.src = './img/hero.jpg'; }}
            />
            <div className="lightbox-caption">
              {gallery[currentImg].label} — {currentImg + 1} / {gallery.length}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
