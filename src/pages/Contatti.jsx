import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { Phone, Mail, MapPin, MessageCircle, ExternalLink } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function Contatti() {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <main className="contact-page" style={{ paddingTop: '120px', minHeight: '100vh' }}>
        <div className="container center text-muted">Caricamento informazioni...</div>
      </main>
    );
  }

  const social = settings?.social || {};
  const hasSocials = social.instagram || social.facebook || social.whatsapp || social.tripadvisor;
  const address = settings?.address;
  const hours = settings?.hours;

  const dayNames = { Mon:'Lunedì', Tue:'Martedì', Wed:'Mercoledì', Thu:'Giovedì', Fri:'Venerdì', Sat:'Sabato', Sun:'Domenica' };

  return (
    <main className="contact-page" style={{ paddingBottom: 0 }}>
      {/* 1. HEADER EDITORIALE */}
      <section className="section" style={{ padding: '160px 0 80px', backgroundColor: 'var(--c-crema)' }}>
        <div className="container center">
          <span className="eyebrow" style={{ color: 'var(--c-gold)', marginBottom: '24px' }}>Contatti</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 10vw, 5.5rem)', lineHeight: 1, marginBottom: '32px' }}>
            Dove trovarci.
          </h1>
          <p className="section-lead" style={{ fontSize: '1.4rem', maxWidth: '700px', margin: '0 auto', color: 'var(--c-forest-light)' }}>
            Siamo aperti per regalarti un momento di puro relax e gusto. 
            Vieni a trovarci, oppure contattaci per qualsiasi richiesta.
          </p>
        </div>
      </section>

      {/* 2. INFORMAZIONI PRINCIPALI (Indirizzo, Telefono, Email) & ORARI */}
      <section className="section" style={{ padding: '80px 0 120px' }}>
        <div className="container split" style={{ alignItems: 'flex-start', gap: '80px' }}>
          
          {/* Colonna Sinistra: Recapit e Social */}
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>{settings.businessName || 'Trattoria Bar Cantone'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Indirizzo */}
              {address && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <MapPin size={24} style={{ color: 'var(--c-terra)', flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '4px' }}>Indirizzo</strong>
                    <a href={settings.maps} target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', color: 'var(--c-forest-light)', lineHeight: '1.6', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                      {address.street}<br/>
                      {address.zip} {address.city} ({address.province})
                    </a>
                  </div>
                </div>
              )}

              {/* Telefono */}
              {settings.phone && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <Phone size={24} style={{ color: 'var(--c-terra)', flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '4px' }}>Telefono</strong>
                    <a href={settings.phoneLink || `tel:${settings.phone}`} style={{ fontSize: '1.1rem', color: 'var(--c-forest-light)' }}>
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {settings.email && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <Mail size={24} style={{ color: 'var(--c-terra)', flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '4px' }}>Email</strong>
                    <a href={`mailto:${settings.email}`} style={{ fontSize: '1.1rem', color: 'var(--c-forest-light)' }}>
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Social */}
              {hasSocials && (
                <div style={{ marginTop: '24px' }}>
                  <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '16px' }}>Seguici su</strong>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {social.instagram && (
                      <a href={social.instagram} target="_blank" rel="noreferrer" className="btn-icon" style={{ border: '1px solid var(--c-line)', color: 'var(--c-forest)' }} aria-label="Instagram">
                        <InstagramIcon />
                      </a>
                    )}
                    {social.facebook && (
                      <a href={social.facebook} target="_blank" rel="noreferrer" className="btn-icon" style={{ border: '1px solid var(--c-line)', color: 'var(--c-forest)' }} aria-label="Facebook">
                        <FacebookIcon />
                      </a>
                    )}
                    {social.whatsapp && (
                      <a href={social.whatsapp} target="_blank" rel="noreferrer" className="btn-icon" style={{ border: '1px solid var(--c-line)', color: 'var(--c-forest)' }} aria-label="WhatsApp">
                        <MessageCircle size={20} />
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Colonna Destra: Orari Dinamici */}
          <div style={{ backgroundColor: 'var(--c-crema-dark)', padding: '48px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '32px', fontFamily: 'var(--font-serif)', color: 'var(--c-forest)' }}>Orari di Apertura</h3>
            
            {hours && hours.schedule ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1.1rem' }}>
                {Object.keys(dayNames).map(day => {
                  const slots = hours.schedule[day];
                  const closed = hours.closedDays?.includes(day);
                  const isOpen = !closed && slots && slots.length > 0;
                  
                  return (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(26,36,33,0.1)', paddingBottom: '12px' }}>
                      <strong style={{ fontWeight: 500, color: 'var(--c-forest)' }}>{dayNames[day]}</strong>
                      <span style={{ color: isOpen ? 'var(--c-forest)' : 'var(--c-terra)' }}>
                        {isOpen ? slots.map(s => `${s.open} - ${s.close}`).join(' | ') : 'Chiuso'}
                      </span>
                    </div>
                  );
                })}
                {hours.note && (
                  <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                    * {hours.note}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted">Orari non disponibili.</p>
            )}
          </div>

        </div>
      </section>

      {/* 3. COME TROVARCI (MAPPA ELEGANTE) */}
      {settings.maps && (
        <section className="section" style={{ padding: '0 0 120px' }}>
          <div className="container">
            <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: 'var(--c-crema)', border: '1px solid var(--c-line)' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2840.7!2d10.8878!3d44.7815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4780254f65a2b5b1%3A0x3af8eba32b01b1a9!2sTrattoria%20Bar%20Cantone!5e0!3m2!1sit!2sit!4v1" 
                title="Mappa posizione Trattoria Bar Cantone" 
                style={{ width: '100%', height: '100%', border: 0 }}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Overlay per rendere la mappa più editoriale */}
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
                <a 
                  href={settings.maps} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary" 
                  style={{ pointerEvents: 'auto', boxShadow: '0 10px 30px rgba(166, 75, 42, 0.4)', padding: '16px 32px' }}
                >
                  Apri in Google Maps <ExternalLink size={18} style={{ marginLeft: '8px' }} />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. CTA PRENOTAZIONE */}
      <section className="section" style={{ backgroundColor: 'var(--c-terra)', color: '#fff', textAlign: 'center', padding: '160px 0' }}>
        <div className="container">
          <h2 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1, marginBottom: '48px' }}>
            Pronto ad <br/><em>assaggiare?</em>
          </h2>
          <Link to="/prenota" className="btn btn-ghost" style={{ fontSize: '1.2rem', padding: '20px 48px', borderWidth: '2px' }}>
            Prenota il tuo tavolo
          </Link>
        </div>
      </section>
    </main>
  );
}
