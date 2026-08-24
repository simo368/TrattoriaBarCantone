import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

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
                  <Instagram size={24} />
                </a>
              )}
              {settings.social?.facebook && (
                <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
                  <Facebook size={24} />
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
