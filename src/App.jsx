import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Public Pages
import Home from './pages/Home';
import Prenota from './pages/Prenota';
import MenuPublic from './pages/MenuPublic';
import ChiSiamo from './pages/ChiSiamo';
import Contatti from './pages/Contatti';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminMenu from './pages/admin/GestisciMenu';
import AdminBookings from './pages/admin/Prenotazioni';

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
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPublic />} />
          <Route path="/chi-siamo" element={<ChiSiamo />} />
          <Route path="/contatti" element={<Contatti />} />
          <Route path="/prenota" element={<Prenota />} />
        </Route>
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="prenotazioni" element={<AdminBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
