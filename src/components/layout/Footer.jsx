import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="footer section">
      <div className="container">
        <div className="footer-grid">
          
          <div className="footer-col">
            <h3 className="footer-title">{settings.businessName || 'Trattoria Bar Cantone'}</h3>
            <p className="footer-text">
              {settings.description || 'Cucina tipica emiliana dal 1968. Pasta fresca tirata a mano e specialità del territorio.'}
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Contatti</h3>
            <div className="footer-contact">
              <div className="contact-item">
                <MapPin size={18} />
                <span>
                  {settings.address?.street}<br/>
                  {settings.address?.zip} {settings.address?.city} ({settings.address?.province})
                </span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <a href={settings.phoneLink || `tel:${settings.phone}`}>{settings.phone}</a>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h3 className="footer-title">Seguici</h3>
            <div className="social-links">
              {settings.social?.instagram && (
                <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {settings.social?.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                  <FacebookIcon />
                </a>
              )}
            </div>
          </div>
          
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {settings.businessName}. Tutti i diritti riservati. | <Link to="/admin/login" style={{ color: 'inherit', textDecoration: 'none' }}>Area Admin</Link></p>
        </div>
      </div>
    </footer>
  );
}
