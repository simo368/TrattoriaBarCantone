import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

export default function Footer() {
  const { settings } = useSettings();
  
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
              <a href={settings.phoneLink}>{settings.phone}</a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Esplora</div>
            <nav className="footer-links">
              <Link to="/chi-siamo">Chi siamo</Link>
              <Link to="/menu">Menù</Link>
              <Link to="/contatti">Dove siamo</Link>
              <Link to="/prenota">Prenota un tavolo</Link>
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
          <span><Link to="/admin/login">Area Riservata</Link></span>
        </div>
      </div>
    </footer>
  );
}
