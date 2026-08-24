import { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';
import { LayoutDashboard, CalendarDays, UtensilsCrossed, LogOut, ExternalLink, Menu as MenuIcon } from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  if (!user) return <Navigate to="/admin/login" />;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="modal-overlay" style={{ zIndex: 40 }} onClick={() => setSidebarOpen(false)} />}
      
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-logo">
          <div className="logo" style={{ color: '#fff' }}>Trattoria <span>Cantone</span></div>
          <small>Pannello di Gestione</small>
        </div>
        
        <nav className="admin-nav">
          <div className="admin-nav-section">Principale</div>
          <Link to="/admin" className={`admin-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={18} className="admin-nav-icon" /> Panoramica
          </Link>
          <Link to="/admin/prenotazioni" className={`admin-nav-item ${location.pathname.includes('/prenotazioni') ? 'active' : ''}`}>
            <CalendarDays size={18} className="admin-nav-icon" /> Prenotazioni
          </Link>
          
          <div className="admin-nav-section">Contenuti</div>
          <Link to="/admin/menu" className={`admin-nav-item ${location.pathname.includes('/menu') ? 'active' : ''}`}>
            <UtensilsCrossed size={18} className="admin-nav-icon" /> Menù
          </Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
              <LogOut size={18} className="admin-nav-icon" /> Esci
            </button>
          </div>
        </nav>
      </aside>
      
      <main className="admin-content">
        <header className="admin-topbar">
          <button className="nav-toggle" style={{ display: 'block' }} onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={24} />
          </button>
          <div>
            <Link to="/" target="_blank" className="btn btn-outline btn-sm">
              Vai al sito <ExternalLink size={14} style={{marginLeft: 4}} />
            </Link>
          </div>
        </header>
        <div className="admin-main">
          <AdminProvider>
            <Outlet />
          </AdminProvider>
        </div>
      </main>
    </div>
  );
}
