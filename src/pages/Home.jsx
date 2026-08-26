import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { useGallery } from '../hooks/useGallery';
import { isOpen } from '../utils/availability';
import { Clock, MapPin, Phone, Star } from 'lucide-react';

export default function Home() {
  const { settings } = useSettings();
  const { images, loading: galleryLoading } = useGallery();

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
            <h1 className="hero-title text-white">
              Trattoria <br/>
              <em>Bar Cantone.</em>
            </h1>
            <p className="hero-lead mt-4">
              {settings.description || "Pasta fresca tirata a mano e il calore di casa, dal 1968."}
            </p>
            <div className="hero-actions mt-4 flex-gap-1">
              <Link to="/prenota" className="btn btn-primary btn-lg">
                Prenota un tavolo
              </Link>
              <Link to="/menu" className="btn btn-ghost btn-lg">
                Scopri il menù
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

      {/* 3/4. LA NOSTRA STORIA & GALLERIA (Uniti) */}
      <section className="section py-xl bg-crema-chiaro">
        <div className="container">
          <div className="center max-w-md mx-auto mb-xl">
            <h2 className="title-xl mb-4">La nostra storia.</h2>
            <p className="text-lead text-forest-dark mb-5">
              {settings.site?.metaDescription || settings.description || "La nostra cucina è un atto d'amore per il territorio. Sfoglia ruvida, sughi lenti e il sorriso di chi ti aspetta a casa."}
            </p>
            <Link to="/chi-siamo" className="btn btn-outline btn-lg">
              Scopri la trattoria
            </Link>
          </div>

          <div className="editorial-gallery">
            {galleryPhotos.length > 0 ? (
              galleryPhotos.map((photo, index) => (
                <div key={photo.id} className={`editorial-img-wrap editorial-img-${index}`}>
                  <img src={photo.url} alt={photo.title || `Foto`} loading="lazy" />
                </div>
              ))
            ) : (
              // Fallback Fotografico
              <>
                <div className="editorial-img-wrap editorial-img-0"><img src="./img/hero.jpg" alt="Interni" loading="lazy" /></div>
                <div className="editorial-img-wrap editorial-img-1"><img src="./img/hero.jpg" alt="Dettagli" loading="lazy" /></div>
                <div className="editorial-img-wrap editorial-img-2"><img src="./img/hero.jpg" alt="Piatti" loading="lazy" /></div>
                <div className="editorial-img-wrap editorial-img-3"><img src="./img/hero.jpg" alt="Atmosfera" loading="lazy" /></div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8/9. CTA PRENOTAZIONE FINALE (Enorme, Impattante) */}
      <section className="section bg-terra text-white center py-xxl">
        <div className="container">
          <h2 className="title-mega text-white mb-5">
            Prenota il tuo tavolo
          </h2>
          <Link to="/prenota" className="btn btn-ghost btn-xl border-2">
            Prenota un tavolo
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
