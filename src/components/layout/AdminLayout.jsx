import { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';
import Drawer from '../admin/ui/Drawer';
import '../../styles/admin.css';

import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock,
  UtensilsCrossed, 
  Image as ImageIcon,
  BarChart3,
  Settings,
  User,
  LogOut, 
  ExternalLink, 
  Menu as MenuIcon 
} from 'lucide-react';

function NavLinks({ location, onNavigate, role }) {
  const isActive = (path) => path === '/admin'
    ? location.pathname === '/admin'
    : location.pathname === path || location.pathname.startsWith(`${path}/`);
  const isManagerOrOwner = role === 'OWNER' || role === 'MANAGER';
  const isOwner = role === 'OWNER';

  return (
    <nav className="admin-nav">
      <div className="admin-nav-section-title">PANORAMICA</div>
      <Link to="/admin" className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`} onClick={onNavigate}>
        <LayoutDashboard size={18} /> Dashboard
      </Link>
      
      <div className="admin-nav-section-title">PRENOTAZIONI</div>
      <Link to="/admin/prenotazioni" className={`admin-nav-item ${isActive('/admin/prenotazioni') ? 'active' : ''}`} onClick={onNavigate}>
        <CalendarDays size={18} /> Prenotazioni
      </Link>
      <Link to="/admin/calendario" className={`admin-nav-item ${isActive('/admin/calendario') ? 'active' : ''}`} onClick={onNavigate}>
        <CalendarDays size={18} /> Calendario
      </Link>
      {isManagerOrOwner && (
        <Link to="/admin/disponibilita" className={`admin-nav-item ${isActive('/admin/disponibilita') ? 'active' : ''}`} onClick={onNavigate}>
          <Clock size={18} /> Disponibilità
        </Link>
      )}
      
      {isManagerOrOwner && (
        <>
          <div className="admin-nav-section-title">CONTENUTI</div>
          <Link to="/admin/menu" className={`admin-nav-item ${isActive('/admin/menu') ? 'active' : ''}`} onClick={onNavigate}>
            <UtensilsCrossed size={18} /> Menù
          </Link>
          <Link to="/admin/gallery" className={`admin-nav-item ${isActive('/admin/gallery') ? 'active' : ''}`} onClick={onNavigate}>
            <ImageIcon size={18} /> Galleria
          </Link>
        </>
      )}
      
      {isManagerOrOwner && (
        <>
          <div className="admin-nav-section-title">ANALISI</div>
          <Link to="/admin/statistiche" className={`admin-nav-item ${isActive('/admin/statistiche') ? 'active' : ''}`} onClick={onNavigate}>
            <BarChart3 size={18} /> Statistiche
          </Link>
        </>
      )}

      {isOwner && (
        <>
          <div className="admin-nav-section-title">SISTEMA</div>
          <Link to="/admin/impostazioni" className={`admin-nav-item ${isActive('/admin/impostazioni') ? 'active' : ''}`} onClick={onNavigate}>
            <Settings size={18} /> Impostazioni
          </Link>
          <Link to="/admin/utenti" className={`admin-nav-item ${isActive('/admin/utenti') ? 'active' : ''}`} onClick={onNavigate}>
            <User size={18} /> Account
          </Link>
        </>
      )}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location]);

  if (!user || !role) return <Navigate to="/admin/login" replace />;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-app">
      {/* Sidebar Desktop */}
      <aside className="admin-sidebar hidden lg:flex">
        <div className="admin-logo-container">
          Trattoria<span style={{ color: 'var(--admin-text-main)', marginLeft: '4px' }}>Cantone</span>
        </div>
        <NavLinks location={location} role={role} onNavigate={() => {}} />
      </aside>

      {/* Drawer Mobile */}
      <Drawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="admin-logo-container">
          Trattoria<span style={{ color: 'var(--admin-text-main)', marginLeft: '4px' }}>Cantone</span>
        </div>
        <NavLinks location={location} role={role} onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <button className="admin-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Apri navigazione pannello">
            <MenuIcon size={24} />
          </button>
          <div className="admin-topbar-actions">
            <Link to="/" target="_blank" className="admin-btn admin-btn-outline admin-btn-sm hidden sm:flex">
              Vai al sito <ExternalLink size={14} />
            </Link>
            <Link to="/admin/account" className="admin-btn admin-btn-icon" style={{ color: 'var(--admin-text-muted)' }} title="Account" aria-label="Apri account">
              <User size={20} />
            </Link>
            <button onClick={handleLogout} className="admin-btn admin-btn-icon" style={{ color: 'var(--admin-text-muted)' }} title="Esci" aria-label="Esci dal pannello">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        
        <main className="admin-content">
          <AdminProvider>
            <Outlet />
          </AdminProvider>
        </main>
      </div>
    </div>
  );
}
