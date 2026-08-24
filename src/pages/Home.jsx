import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useMenu } from '../hooks/useMenu';
import { useGallery } from '../hooks/useGallery';
import { Clock, MapPin, Utensils, Phone, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  const { settings } = useSettings();
  const { menu, loading: menuLoading } = useMenu();
  const { images, loading: galleryLoading } = useGallery();

  const signatureDishes = [];
  if (!menuLoading) {
    const allDishes = [...(menu.primi || []), ...(menu.secondi || [])].filter(d => d.active);
    signatureDishes.push(...allDishes.slice(0, 4));
  }

  const galleryPhotos = !galleryLoading ? images.filter(img => img.active).slice(0, 4) : [];

  return (
    <main id="home" className="home-page">
      {/* 1. HERO VISIVA */}
      <section className="hero">
        <div className="hero-bg">
          <img src="./img/hero.jpg" alt="Atmosfera Trattoria Bar Cantone" loading="lazy" />
        </div>
        <div className="container">
          <div className="hero-copy">
            <div className="eyebrow">{settings.address?.city} · Dal 1968</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 10vw, 5.5rem)', lineHeight: '1' }}>
              Autentica. <br/>
              <em>Emiliana.</em>
            </h1>
            <p className="hero-lead" style={{ fontSize: '1.25rem', marginTop: '24px' }}>
              Pasta fresca tirata a mano e il calore di casa.
            </p>
            <div className="hero-actions" style={{ marginTop: '32px' }}>
              <Link to="/prenota" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1rem' }}>
                Prenota il tuo tavolo
              </Link>
            </div>
            
            {settings.ratings?.google && (
              <div className="hero-proof" style={{ marginTop: '60px' }}>
                <span className="hero-stars" style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(settings.ratings.google.stars || 4)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </span>
                <strong style={{color:'var(--c-gold)', fontSize: '1.2rem'}}>{settings.ratings.google.score}</strong>
                <span style={{opacity: 0.8}}>{settings.ratings.google.platform}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. INFO BAR MINIMAL */}
      <div className="info-bar" style={{ padding: '24px 0' }}>
        <div className="container info-bar-grid">
          <div className="info-item" style={{ border: 'none', padding: '16px' }}>
            <div className="info-icon"><MapPin size={24} /></div>
            <div>
              <span className="info-value">{settings.address?.city}</span>
            </div>
          </div>
          <div className="info-item" style={{ border: 'none', padding: '16px' }}>
            <div className="info-icon"><Clock size={24} /></div>
            <div>
              <span className="info-value">Aperti oggi</span>
            </div>
          </div>
          <div className="info-item" style={{ border: 'none', padding: '16px' }}>
            <div className="info-icon"><Phone size={24} /></div>
            <div>
              <span className="info-value">{settings.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IDENTITÀ (Immagine grande, testo essenziale) */}
      <section className="section about">
        <div className="container split" style={{ gap: '120px' }}>
          <div className="img-frame" style={{ order: 1 }}>
            <img 
              src="./img/hero.jpg" 
              alt="Pasta fresca" 
              loading="lazy" 
              style={{ height: '700px', borderRadius: '0' }}
            />
          </div>
          <div className="about-copy" style={{ order: 0, paddingRight: '40px' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '32px' }}>Come una volta.</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--c-forest-light)', lineHeight: '1.8' }}>
              La nostra cucina è un atto d'amore per il territorio. 
              Sfoglia ruvida, sughi lenti e il sorriso di chi ti aspetta a casa.
            </p>
            <Link to="/chi-siamo" className="btn btn-outline" style={{ marginTop: '48px', padding: '16px 32px' }}>
              Scopri la trattoria
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PIATTI FIRMA (Tipografia Raffinata) */}
      <section className="section" style={{ backgroundColor: 'var(--c-crema-dark)', padding: '120px 0' }}>
        <div className="container">
          <div className="center" style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '3.5rem' }}>La Tradizione.</h2>
          </div>

          {!menuLoading && signatureDishes.length > 0 && (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {signatureDishes.map(dish => (
                <div key={dish.id} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', borderBottom: '1px solid rgba(26,36,33,0.1)', paddingBottom: '24px' }}>
                  <div style={{ paddingRight: '20px', flex: '1 1 200px' }}>
                    <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', color: 'var(--c-forest)', margin: 0 }}>{dish.name}</h3>
                    {dish.description && <p style={{ fontSize: '1rem', color: 'var(--c-text-muted)', marginTop: '8px' }}>{dish.description}</p>}
                  </div>
                  <span style={{ fontSize: '1.4rem', fontFamily: 'var(--font-sans)', color: 'var(--c-terra)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    € {Number(dish.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="center" style={{ marginTop: '80px' }}>
            <Link to="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--c-forest)', textDecoration: 'underline', textUnderlineOffset: '8px' }}>
              Sfoglia l'intero menù <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MENU FISSO (Hero Secondaria) */}
      <section className="section" style={{ position: 'relative', minHeight: '60vh', display: 'flex', alignItems: 'center', backgroundColor: 'var(--c-forest)' }}>
        <div className="container center" style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <span className="eyebrow" style={{ color: 'var(--c-gold)', marginBottom: '24px' }}>Pausa Pranzo</span>
          <h2 style={{ fontSize: '4rem', color: '#fff', marginBottom: '24px' }}>Menù Fisso a 15€</h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto' }}>
            Primo, secondo, contorno, acqua, vino e caffè. Dal lunedì al venerdì.
          </p>
        </div>
      </section>

      {/* 6. GALLERIA IMMAGINI (Masonry / Staggered) */}
      <section className="section" style={{ padding: '120px 0' }}>
        <div className="container">
          <div className="gallery-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '32px', gridAutoRows: 'auto' }}>
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((photo, index) => (
                <div key={photo.id} style={{ transform: index % 2 !== 0 ? 'translateY(60px)' : 'none' }}>
                  <img src={photo.url} alt={photo.title || `Foto`} loading="lazy" style={{ width: '100%', height: '500px', objectFit: 'cover' }} />
                </div>
              ))
            ) : (
              // Fallback Fotografico
              <>
                <div style={{ transform: 'translateY(0)' }}><img src="./img/hero.jpg" alt="Interni" loading="lazy" style={{ width: '100%', height: '600px', objectFit: 'cover' }} /></div>
                <div style={{ transform: 'translateY(120px)' }}><img src="./img/hero.jpg" alt="Dettagli" loading="lazy" style={{ width: '100%', height: '500px', objectFit: 'cover' }} /></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8/9. CTA PRENOTAZIONE FINALE (Enorme, Impattante) */}
      <section className="section" style={{ backgroundColor: 'var(--c-terra)', color: '#fff', textAlign: 'center', padding: '160px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, marginBottom: '48px' }}>
            Il tavolo <br/><em>è pronto.</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '20px 48px', borderWidth: '2px' }}>
            Prenota Ora
          </Link>
        </div>
      </section>

      {/* 10. CONTATTI (Clean, Visual) */}
      <section className="section" style={{ padding: '120px 0' }}>
        <div className="container split" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '3rem', marginBottom: '40px' }}>Dove Siamo.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '1.2rem', color: 'var(--c-forest)' }}>
              <a href={settings.maps} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                {settings.address?.street}, {settings.address?.city}
              </a>
              <a href={settings.phoneLink || `tel:${settings.phone}`} style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                {settings.phone}
              </a>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>Orari</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--c-text-muted)' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const dayNames = { Mon:'Lunedì', Tue:'Martedì', Wed:'Mercoledì', Thu:'Giovedì', Fri:'Venerdì', Sat:'Sabato', Sun:'Domenica' };
                const slots = settings.hours?.schedule?.[day];
                const closed = settings.hours?.closedDays?.includes(day);
                const isOpen = !closed && slots && slots.length > 0;
                
                return (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-line)', paddingBottom: '12px' }}>
                    <strong style={{ fontWeight: 500, color: 'var(--c-forest)' }}>{dayNames[day]}</strong>
                    <span>{isOpen ? slots.map(s => `${s.open} - ${s.close}`).join(' | ') : 'Chiuso'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
