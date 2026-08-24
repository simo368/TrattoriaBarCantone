import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            Trattoria <span>Bar Cantone</span><small>Tradizione emiliana</small>
          </Link>
          <nav className="nav-links">
            <a href="/#chi-siamo">Chi siamo</a>
            <a href="/#menu">Menù</a>
            <a href="/#galleria">Galleria</a>
            <a href="/#recensioni">Recensioni</a>
            <a href="/#contatti">Dove siamo</a>
          </nav>
          <Link to="/prenota" className="btn btn-primary nav-cta">📞 Prenota al telefono</Link>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </header>
      <div className={`nav-panel ${menuOpen ? 'open' : ''}`}>
        <a href="/#chi-siamo" onClick={() => setMenuOpen(false)}>Chi siamo</a>
        <a href="/#menu" onClick={() => setMenuOpen(false)}>Menù</a>
        <a href="/#galleria" onClick={() => setMenuOpen(false)}>Galleria</a>
        <a href="/#recensioni" onClick={() => setMenuOpen(false)}>Recensioni</a>
        <a href="/#contatti" onClick={() => setMenuOpen(false)}>Dove siamo</a>
        <Link to="/prenota" className="btn btn-primary" onClick={() => setMenuOpen(false)}>📞 Prenota</Link>
      </div>
    </>
  );
}
