import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBookingsList, adminCreateBooking } from '../../hooks/useAdminBookings';
import { useSettings } from '../../hooks/useSettings';
import { updateBookingStatus, BOOKING_STATUS } from '../../hooks/useBookings';
import { isOpen, getServicePeriods } from '../../utils/availability';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import PageHeader from '../../components/admin/ui/PageHeader';
import StatCard from '../../components/admin/ui/StatCard';
import ActionButton from '../../components/admin/ui/ActionButton';
import BookingCard from '../../components/admin/bookings/BookingCard';
import BookingDetailDrawer from '../../components/admin/bookings/BookingDetailDrawer';
import BookingFormModal from '../../components/admin/bookings/BookingFormModal';
import LoadingState from '../../components/admin/ui/LoadingState';
import { Users, Calendar, Plus, Clock, AlertTriangle, Coffee, Utensils, Settings, LayoutList } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  // Settings e calcoli base
  const { settings, loading: settingsLoading } = useSettings();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');

  // Scarica SOLO i dati di oggi per evitare sovraccarichi
  const { bookings, loading: bookingsLoading, error } = useAdminBookingsList(todayStr, todayStr);

  const stats = useMemo(() => {
    if (!bookings || !settings) return null;

    const valid = bookings.filter(b => b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.NO_SHOW);
    const cancelled = bookings.filter(b => b.status === BOOKING_STATUS.CANCELLED);
    const noShows = bookings.filter(b => b.status === BOOKING_STATUS.NO_SHOW);
    
    const covers = valid.reduce((sum, b) => sum + (b.guests || 0), 0);
    const maxCovers = settings.maxCoversPerService || 120; // Capacità stimata base se non configurata

    // Trova la prossima prenotazione
    const upcoming = valid
      .filter(b => b.time >= currentTime && b.status !== BOOKING_STATUS.COMPLETED && b.status !== BOOKING_STATUS.ARRIVED)
      .sort((a, b) => a.time.localeCompare(b.time));

    // Determina servizio attuale o prossimo
    const periods = getServicePeriods(todayStr, settings);
    let currentService = 'Chiuso';
    let isServiceActive = false;
    
    if (isOpen(todayStr, settings) && periods.length > 0) {
      const isLunch = parseInt(currentTime.split(':')[0]) < 16;
      currentService = isLunch ? 'Pranzo' : 'Cena';
      
      const activePeriod = periods.find(p => {
        const [oh] = p.open.split(':').map(Number);
        const [ch] = p.close.split(':').map(Number);
        const curr = parseInt(currentTime.split(':')[0]);
        return curr >= oh - 1 && curr <= ch; // Consideriamo attivo 1 ora prima
      });
      isServiceActive = !!activePeriod;
    }

    return {
      totalBookings: valid.length,
      covers,
      pendingCount: bookings.filter(b => b.status === BOOKING_STATUS.PENDING).length,
      nextBooking: upcoming.length > 0 ? upcoming[0] : null,
      currentService,
      isServiceActive
    };
  }, [bookings, settings, currentTime, todayStr]);

  // Handler per le modifiche di stato
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      toast.success('Stato aggiornato');
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      toast.error('Errore durante l\'aggiornamento dello stato');
    }
  };

  const handleCreateBooking = async (formData) => {
    try {
      await adminCreateBooking(formData, settings.maxCoversPerSlot);
      toast.success('Nuova prenotazione creata');
    } catch (error) {
      toast.error(error.message === 'SLOT_FULL' ? 'Capienza massima raggiunta per questo orario.' : 'Impossibile creare la prenotazione.');
      throw error;
    }
  };

  if (settingsLoading || bookingsLoading) return <LoadingState />;
  if (error) return <div style={{ padding: '24px', color: 'red' }}>Errore caricamento dati: {error}</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-primary)', marginBottom: '4px' }}>OGGI</h1>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--admin-text-main)' }}>{format(now, 'EEEE d MMMM yyyy', { locale: it }).toUpperCase()}</h2>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <StatCard 
            title="PRENOTAZIONI" 
            value={stats.totalBookings}
            icon={Calendar} 
            trend="Di oggi" 
            trendUp={true}
          />
          
          <StatCard 
            title="COPERTI" 
            value={stats.covers}
            icon={Users} 
            trend="Totali previsti" 
            trendUp={true}
          />

          <StatCard 
            title="DA CONFERMARE" 
            value={stats.pendingCount}
            icon={AlertTriangle} 
            trend={stats.pendingCount > 0 ? "Richiede attenzione" : "Tutto confermato"}
            trendUp={stats.pendingCount === 0}
            style={stats.pendingCount > 0 ? { borderLeft: '4px solid var(--admin-warning)' } : {}}
          />
          
          <StatCard 
            title="PROSSIMA PRENOT." 
            value={stats.nextBooking ? stats.nextBooking.time : '--:--'}
            icon={Clock} 
            trend={stats.nextBooking ? `${stats.nextBooking.name} (${stats.nextBooking.guests} pax)` : "Nessun arrivo imminente"} 
            trendUp={true}
          />
        </div>
      )}

      {/* AZIONI RAPIDE */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--admin-text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AZIONI RAPIDE</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <button className="admin-quick-action" onClick={() => setIsNewBookingModalOpen(true)}>
            <Plus size={20} />
            <span>Nuova Prenotazione</span>
          </button>
          <button className="admin-quick-action" onClick={() => navigate('/admin/disponibilita')}>
            <Clock size={20} />
            <span>Gestisci Disponibilità</span>
          </button>
          <button className="admin-quick-action" onClick={() => navigate('/admin/menu')}>
            <Utensils size={20} />
            <span>Gestisci Menù</span>
          </button>
          <button className="admin-quick-action" onClick={() => navigate('/admin/calendario')}>
            <Calendar size={20} />
            <span>Visualizza Calendario</span>
          </button>
        </div>
      </div>

      {/* TIMELINE PRENOTAZIONI DI OGGI */}
      <div className="admin-stat-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--admin-border)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-text-main)' }}>
            PRENOTAZIONI DI OGGI
          </h3>
        </div>
        
        {bookings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
            <Calendar size={48} color="var(--admin-border)" style={{ margin: '0 auto 16px' }} />
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Nessuna prenotazione prevista per oggi.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...bookings].sort((a,b) => a.time.localeCompare(b.time)).map((booking, idx) => (
              <div 
                key={booking.id} 
                className="admin-booking-row"
                onClick={() => setSelectedBooking(booking)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 1fr 100px 140px', 
                  gap: '16px', 
                  alignItems: 'center', 
                  padding: '16px 24px', 
                  borderBottom: idx < bookings.length - 1 ? '1px solid var(--admin-border)' : 'none',
                  cursor: 'pointer',
                  backgroundColor: 'var(--admin-surface)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--admin-bg)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--admin-surface)'}
              >
                <strong style={{ fontSize: '1.1rem', color: 'var(--admin-primary)' }}>{booking.time}</strong>
                <div>
                  <div style={{ fontWeight: 600 }}>{booking.name}</div>
                  {booking.phone && <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>{booking.phone}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Users size={16} color="var(--admin-text-muted)" /> {booking.guests} pax
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: booking.status === BOOKING_STATUS.PENDING ? 'var(--admin-warning-light)' : (booking.status === BOOKING_STATUS.CONFIRMED ? 'var(--admin-success-light)' : 'var(--admin-bg)'),
                    color: booking.status === BOOKING_STATUS.PENDING ? 'var(--admin-warning)' : (booking.status === BOOKING_STATUS.CONFIRMED ? 'var(--admin-success)' : 'var(--admin-text-muted)')
                  }}>
                    {booking.status === BOOKING_STATUS.PENDING ? 'Da confermare' : booking.status === BOOKING_STATUS.CONFIRMED ? 'Confermata' : booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingDetailDrawer 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        booking={selectedBooking} 
        onStatusChange={handleStatusChange}
      />

      {isNewBookingModalOpen && (
        <BookingFormModal 
          isOpen={true} 
          onClose={() => setIsNewBookingModalOpen(false)} 
          onSave={handleCreateBooking}
          bookingsList={bookings}
        />
      )}
    </div>
  );
}
