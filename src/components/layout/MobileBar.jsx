import { Link } from 'react-router-dom';
import { settingsStore } from '../../utils/localStore';

export default function MobileBar() {
  const settings = settingsStore.get();
  
  return (
    <nav className="mobile-bar">
      <div className="mobile-bar-inner">
        <a href={settings.phoneLink} className="mobile-bar-btn">
          <span className="mobile-bar-icon">📞</span>Chiama
        </a>
        <a href="/#menu" className="mobile-bar-btn">
          <span className="mobile-bar-icon">🍝</span>Menù
        </a>
        <a href={settings.maps} target="_blank" rel="noreferrer" className="mobile-bar-btn">
          <span className="mobile-bar-icon">🗺️</span>Indicazioni
        </a>
      </div>
    </nav>
  );
}
