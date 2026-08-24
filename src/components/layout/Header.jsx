import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, Phone } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="logo" aria-label="Home Trattoria Bar Cantone">
            Trattoria <span>Bar Cantone</span><small>Tradizione emiliana</small>
          </Link>
          <nav className="nav-links" aria-label="Navigazione principale">
            <Link to="/chi-siamo">Chi siamo</Link>
            <Link to="/menu">Menù</Link>
            <Link to="/contatti">Dove siamo</Link>
            <a href="tel:+39059000000" className="nav-phone"><Phone size={16} /> 059 000000</a>
          </nav>
          <Link to="/prenota" className="btn btn-primary nav-cta">
            Prenota un tavolo
          </Link>
          <button 
            className="nav-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Apri menu di navigazione"
          >
            <MenuIcon size={26} />
          </button>
        </div>
      </header>
      <div className={`nav-panel ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <Link to="/chi-siamo">Chi siamo</Link>
        <Link to="/menu">Menù</Link>
        <Link to="/contatti">Dove siamo</Link>
        <a href="tel:+39059000000"><Phone size={16} style={{display:'inline', marginRight:'8px', verticalAlign:'-3px'}}/> Chiama ora</a>
        <Link to="/prenota" className="btn btn-primary" style={{marginTop: '8px'}}>
          Prenota un tavolo
        </Link>
      </div>
    </>
  );
}
