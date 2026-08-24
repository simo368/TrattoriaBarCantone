import { settingsStore } from '../../utils/localStore';

export default function Footer() {
  const settings = settingsStore.get();
  
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">Trattoria <span>Bar Cantone</span></div>
            <div className="footer-tagline">Tradizione emiliana · Carpi (MO)</div>
            <div className="footer-address">
              {settings.address.street}<br/>
              {settings.address.zip} {settings.address.city} ({settings.address.province})<br/>
              <a href={settings.phoneLink}>📞 {settings.phone}</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Esplora</div>
            <nav className="footer-links">
              <a href="/#chi-siamo">Chi siamo</a>
              <a href="/#menu">Menù</a>
              <a href="/#galleria">Galleria</a>
              <a href="/#recensioni">Recensioni</a>
              <a href="/#contatti">Dove siamo</a>
            </nav>
          </div>
          <div>
            <div className="footer-col-title">Seguici</div>
            <nav className="footer-links">
              <a href={settings.social.instagram} target="_blank" rel="noreferrer">Instagram</a>
              <a href={settings.social.facebook} target="_blank" rel="noreferrer">Facebook</a>
              <a href={settings.social.tripadvisor} target="_blank" rel="noreferrer">Tripadvisor</a>
            </nav>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Trattoria Bar Cantone · Tutti i diritti riservati</span>
          <span><a href="/admin/login">Area Riservata</a></span>
        </div>
      </div>
    </footer>
  );
}
