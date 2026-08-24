import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { Phone, Utensils, Calendar } from 'lucide-react';

export default function MobileBar() {
  const { settings } = useSettings();
  
  return (
    <nav className="mobile-bar" aria-label="Navigazione rapida mobile">
      <div className="mobile-bar-inner">
        <a href={settings.phoneLink || `tel:${settings.phone}`} className="mobile-bar-btn" aria-label="Chiama il ristorante">
          <Phone size={20} className="mobile-bar-icon" aria-hidden="true" />
          <span>Chiama</span>
        </a>
        <Link to="/menu" className="mobile-bar-btn" aria-label="Visualizza il menù">
          <Utensils size={20} className="mobile-bar-icon" aria-hidden="true" />
          <span>Menù</span>
        </Link>
        <Link to="/prenota" className="mobile-bar-btn" aria-label="Prenota un tavolo">
          <Calendar size={20} className="mobile-bar-icon" aria-hidden="true" />
          <span>Prenota</span>
        </Link>
      </div>
    </nav>
  );
}
