import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useMenu } from '../hooks/useMenu';
import { useGallery } from '../hooks/useGallery';
import { isOpen } from '../utils/availability';
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

  const todayIsOpen = isOpen(new Date(), settings);

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
            <h1 className="hero-title">
              Autentica. <br/>
              <em>Emiliana.</em>
            </h1>
            <p className="hero-lead mt-4">
              Pasta fresca tirata a mano e il calore di casa.
            </p>
            <div className="hero-actions mt-4">
              <Link to="/prenota" className="btn btn-primary btn-lg">
                Prenota il tuo tavolo
              </Link>
            </div>
            
            {settings.ratings?.google && (
              <div className="hero-proof mt-5">
                <span className="hero-stars flex-gap-1">
                  {[...Array(settings.ratings.google.stars || 4)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </span>
                <strong className="text-gold text-lg">{settings.ratings.google.score}</strong>
                <span className="text-muted">{settings.ratings.google.platform}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. INFO BAR MINIMAL */}
      <div className="info-bar py-4">
        <div className="container info-bar-grid">
          <div className="info-item no-border p-3">
            <div className="info-icon"><MapPin size={24} /></div>
            <div>
              <span className="info-value">{settings.address?.city}</span>
            </div>
          </div>
          <div className="info-item no-border p-3">
            <div className="info-icon"><Clock size={24} /></div>
            <div>
              <span className="info-value">{todayIsOpen ? "Aperti oggi" : "Chiusi oggi"}</span>
            </div>
          </div>
          <div className="info-item no-border p-3">
            <div className="info-icon"><Phone size={24} /></div>
            <div>
              <span className="info-value">{settings.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IDENTITÀ (Immagine grande, testo essenziale) */}
      <section className="section about">
        <div className="container split gap-lg">
          <div className="img-frame order-1">
            <img 
              src="./img/hero.jpg" 
              alt="Pasta fresca" 
              loading="lazy" 
              className="img-tall no-radius"
            />
          </div>
          <div className="about-copy order-0 pr-5">
            <h2 className="title-lg mb-4">Come una volta.</h2>
            <p className="text-lead text-forest-light">
              La nostra cucina è un atto d'amore per il territorio. 
              Sfoglia ruvida, sughi lenti e il sorriso di chi ti aspetta a casa.
            </p>
            <Link to="/chi-siamo" className="btn btn-outline mt-5 btn-lg">
              Scopri la trattoria
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PIATTI FIRMA (Tipografia Raffinata) */}
      <section className="section bg-crema-dark py-xl">
        <div className="container">
          <div className="center mb-5">
            <h2 className="title-xl">La Tradizione.</h2>
          </div>

          {!menuLoading && signatureDishes.length > 0 && (
            <div className="signature-menu-list">
              {signatureDishes.map(dish => (
                <div key={dish.id} className="signature-menu-item">
                  <div className="signature-menu-info">
                    <h3 className="signature-menu-title">{dish.name}</h3>
                    {dish.description && <p className="signature-menu-desc">{dish.description}</p>}
                  </div>
                  <span className="signature-menu-price">
                    € {Number(dish.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="center mt-5">
            <Link to="/menu" className="link-with-icon text-lg text-forest fw-bold underline underline-offset">
              Sfoglia l'intero menù <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. MENU FISSO (Hero Secondaria) */}
      <section className="section menu-fisso-hero bg-forest flex-center">
        <div className="container center relative z-1 text-white">
          <span className="eyebrow text-gold mb-4">Pausa Pranzo</span>
          <h2 className="title-xxl text-white mb-4">Menù Fisso a {settings?.prices?.menuFisso || 15}€</h2>
          <p className="text-lead text-white-70 max-w-sm mx-auto">
            Primo, secondo, contorno, acqua, vino e caffè. Dal lunedì al venerdì.
          </p>
        </div>
      </section>

      {/* 6. GALLERIA IMMAGINI (Masonry / Staggered) */}
      <section className="section py-xl">
        <div className="container">
          <div className="gallery-grid gallery-grid-2cols">
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((photo, index) => (
                <div key={photo.id} className={index % 2 !== 0 ? 'offset-y' : ''}>
                  <img src={photo.url} alt={photo.title || `Foto`} loading="lazy" className="gallery-img-tall" />
                </div>
              ))
            ) : (
              // Fallback Fotografico
              <>
                <div><img src="./img/hero.jpg" alt="Interni" loading="lazy" className="gallery-img-tall" /></div>
                <div className="offset-y"><img src="./img/hero.jpg" alt="Dettagli" loading="lazy" className="gallery-img-tall" /></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8/9. CTA PRENOTAZIONE FINALE (Enorme, Impattante) */}
      <section className="section bg-terra text-white center py-xxl">
        <div className="container">
          <h2 className="title-mega text-white mb-5">
            Il tavolo <br/><em>è pronto.</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost btn-xl border-2">
            Prenota Ora
          </Link>
        </div>
      </section>

      {/* 10. CONTATTI (Clean, Visual) */}
      <section className="section py-xl">
        <div className="container split items-start">
          <div>
            <h2 className="title-lg mb-5">Dove Siamo.</h2>
            <div className="contact-links flex-col gap-4 text-lg text-forest">
              <a href={settings.maps} target="_blank" rel="noreferrer" className="underline underline-offset">
                {settings.address?.street}, {settings.address?.city}
              </a>
              <a href={settings.phoneLink || `tel:${settings.phone}`} className="underline underline-offset">
                {settings.phone}
              </a>
            </div>
          </div>
          <div>
            <h3 className="title-md mb-4 font-sans fw-600">Orari</h3>
            <div className="schedule-list flex-col gap-3 text-muted">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const dayNames = { Mon:'Lunedì', Tue:'Martedì', Wed:'Mercoledì', Thu:'Giovedì', Fri:'Venerdì', Sat:'Sabato', Sun:'Domenica' };
                const slots = settings.hours?.schedule?.[day];
                const closed = settings.hours?.closedDays?.includes(day);
                const isOpen = !closed && slots && slots.length > 0;
                
                return (
                  <div key={day} className="schedule-item flex-between border-b pb-2">
                    <strong className="fw-500 text-forest">{dayNames[day]}</strong>
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
