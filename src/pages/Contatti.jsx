import { Link } from 'react-router-dom';
import { settingsStore } from '../utils/localStore';

export default function Contatti() {
  const settings = settingsStore.get();

  return (
    <main style={{ paddingTop: '76px' }}>
      <section className="section contact-section">
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
              <a href={settings.social.instagram} className="social-link" target="_blank" rel="noreferrer">Instagram</a>
              <a href={settings.social.facebook} className="social-link" target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
          <div>
            <iframe className="map-frame" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2840.7!2d10.8878!3d44.7815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4780254f65a2b5b1%3A0x3af8eba32b01b1a9!2sTrattoria%20Bar%20Cantone!5e0!3m2!1sit!2sit!4v1" title="Mappa" loading="lazy" />
            <div className="cta-box">
              <h3>Prenota il tuo tavolo</h3>
              <p>Assicurati il tuo posto per gustare la vera cucina emiliana. La prenotazione online è veloce e immediata.</p>
              <Link to="/prenota" className="btn btn-primary btn-full">Prenota Subito Online</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
