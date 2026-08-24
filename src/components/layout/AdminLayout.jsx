import { useEffect, useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { authStore } from '../../utils/localStore';

export default function AdminLayout() {
  const isLogged = authStore.isLogged();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location]);

  if (!isLogged) return <Navigate to="/admin/login" />;

  const handleLogout = () => {
    authStore.logout();
    window.location.href = '/admin/login';
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
            <span className="admin-nav-icon">📊</span> Panoramica
          </Link>
          <Link to="/admin/prenotazioni" className={`admin-nav-item ${location.pathname.includes('/prenotazioni') ? 'active' : ''}`}>
            <span className="admin-nav-icon">📅</span> Prenotazioni
          </Link>
          
          <div className="admin-nav-section">Contenuti</div>
          <Link to="/admin/menu" className={`admin-nav-item ${location.pathname.includes('/menu') ? 'active' : ''}`}>
            <span className="admin-nav-icon">🍝</span> Menù
          </Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button onClick={handleLogout} className="admin-nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
              <span className="admin-nav-icon">🚪</span> Esci
            </button>
          </div>
        </nav>
      </aside>
      
      <main className="admin-content">
        <header className="admin-topbar">
          <button className="nav-toggle" style={{ display: 'block' }} onClick={() => setSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div>
            <Link to="/" target="_blank" className="btn btn-outline btn-sm">Vai al sito ↗</Link>
          </div>
        </header>
        <div className="admin-main">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
