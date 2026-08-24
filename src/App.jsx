import { HashRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Home from './pages/Home';
import Prenota from './pages/Prenota';
import CancellaPrenotazione from './pages/CancellaPrenotazione';
import MenuPublic from './pages/MenuPublic';
import ChiSiamo from './pages/ChiSiamo';
import Contatti from './pages/Contatti';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/GestisciMenu';
import AdminBookings from './pages/admin/Prenotazioni';
import AdminCalendario from './pages/admin/Calendario';
import AdminDisponibilita from './pages/admin/Disponibilita';
import AdminGalleria from './pages/admin/Galleria';
import AdminStatistiche from './pages/admin/Statistiche';
import AdminImpostazioni from './pages/admin/Impostazioni';
import AdminAccount from './pages/admin/Account';
import Utenti from './pages/admin/Utenti';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileBar from './components/layout/MobileBar';
import AdminLayout from './components/layout/AdminLayout';

const PublicLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <MobileBar />
  </>
);

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPublic />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/prenota" element={<Prenota />} />
          <Route path="/prenota/cancella/:id" element={<CancellaPrenotazione />} />
        </Route>
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="prenotazioni" element={<AdminBookings />} />
          <Route path="calendario" element={<AdminCalendario />} />
          <Route path="disponibilita" element={<AdminDisponibilita />} />
          <Route path="gallery" element={<AdminGalleria />} />
          <Route path="statistiche" element={<AdminStatistiche />} />
          <Route path="impostazioni" element={<AdminImpostazioni />} />
          <Route path="utenti" element={<Utenti />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
