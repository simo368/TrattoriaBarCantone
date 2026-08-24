import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { Phone, Utensils, MapPin } from 'lucide-react';

export default function MobileBar() {
  const { settings } = useSettings();
  
  return (
    <nav className="mobile-bar">
      <div className="mobile-bar-inner">
        <a href={settings.phoneLink} className="mobile-bar-btn">
          <Phone size={20} className="mobile-bar-icon" />
          <span>Chiama</span>
        </a>
        <Link to="/menu" className="mobile-bar-btn">
          <Utensils size={20} className="mobile-bar-icon" />
          <span>Menù</span>
        </Link>
        <a href={settings.maps} target="_blank" rel="noreferrer" className="mobile-bar-btn">
          <MapPin size={20} className="mobile-bar-icon" />
          <span>Mappa</span>
        </a>
      </div>
    </nav>
  );
}
