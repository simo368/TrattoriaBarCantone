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
          <Link to="/" className="logo">
            Trattoria <span>Bar Cantone</span><small>Tradizione emiliana</small>
          </Link>
          <nav className="nav-links">
            <Link to="/chi-siamo">Chi siamo</Link>
            <Link to="/menu">Menù</Link>
            <Link to="/contatti">Dove siamo</Link>
          </nav>
          <Link to="/prenota" className="btn btn-primary nav-cta">
            <Phone size={16} /> Prenota un tavolo
          </Link>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <MenuIcon size={26} />
          </button>
        </div>
      </header>
      <div className={`nav-panel ${menuOpen ? 'open' : ''}`}>
        <Link to="/chi-siamo">Chi siamo</Link>
        <Link to="/menu">Menù</Link>
        <Link to="/contatti">Dove siamo</Link>
        <Link to="/prenota" className="btn btn-primary">
          <Phone size={16} /> Prenota
        </Link>
      </div>
    </>
  );
}
