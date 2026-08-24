import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminBookingsList } from '../../hooks/useAdminBookings';
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
      capacityPercentage: Math.min(Math.round((covers / maxCovers) * 100), 100),
      cancelledCount: cancelled.length,
      noShowCount: noShows.length,
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

  if (settingsLoading || bookingsLoading) return <LoadingState />;
  if (error) return <div style={{ padding: '24px', color: 'red' }}>Errore caricamento dati: {error}</div>;

  return (
    <div>
      <PageHeader 
        title={`Dashboard - ${format(now, 'EEEE d MMMM', { locale: it })}`} 
        subtitle="Panoramica operativa in tempo reale della giornata odierna."
      >
        <ActionButton icon={Plus} onClick={() => setIsNewBookingModalOpen(true)}>Nuova Prenotazione</ActionButton>
      </PageHeader>

      {/* AZIONI RAPIDE (Mobile-friendly grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <button className="admin-quick-action" onClick={() => navigate('/admin/prenotazioni')}>
          <LayoutList size={20} />
          <span>Tutte le Prenot.</span>
        </button>
        <button className="admin-quick-action" onClick={() => navigate('/admin/calendario')}>
          <Calendar size={20} />
          <span>Calendario</span>
        </button>
        <button className="admin-quick-action" onClick={() => navigate('/admin/disponibilita')}>
          <Clock size={20} />
          <span>Disponibilità</span>
        </button>
        <button className="admin-quick-action" onClick={() => navigate('/admin/menu')}>
          <Utensils size={20} />
          <span>Menù</span>
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* STATS PRINCIPALI */}
          <StatCard 
            title="Coperti Odierni" 
            value={`${stats.covers} pax`}
            icon={Users} 
            trend={stats.totalBookings > 0 ? `${stats.totalBookings} prenotazioni valide` : 'Nessuna prenotazione'} 
            trendUp={true}
          />
          
          <StatCard 
            title="Servizio Attuale" 
            value={stats.currentService}
            icon={stats.currentService === 'Pranzo' ? Coffee : Utensils} 
            trend={stats.isServiceActive ? 'In corso...' : 'In attesa'} 
            trendUp={stats.isServiceActive}
          />

          <StatCard 
            title="Capacità Residua" 
            value={`${100 - stats.capacityPercentage}%`}
            icon={Clock} 
            trend="Calcolata sul turno intero"
            trendUp={stats.capacityPercentage < 90}
          />
          
          {/* CANCELLAZIONI / CRITICITÀ */}
          {(stats.cancelledCount > 0 || stats.noShowCount > 0) && (
            <StatCard 
              title="Criticità" 
              value={`${stats.cancelledCount + stats.noShowCount}`}
              icon={AlertTriangle} 
              trend={`${stats.cancelledCount} Canc. / ${stats.noShowCount} No-show`} 
              trendUp={false}
            />
          )}
        </div>
      )}

      {/* TIMELINE PRENOTAZIONI DI OGGI */}
      <div className="admin-stat-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="var(--admin-primary)" /> Timeline Prenotazioni (Oggi)
        </h3>
        
        {bookings.length === 0 ? (
          <p style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '24px' }}>Non ci sono prenotazioni per la giornata odierna.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Ordiniamo cronologicamente */}
            {[...bookings].sort((a,b) => a.time.localeCompare(b.time)).map(booking => (
              <BookingCard key={booking.id} booking={booking} onClick={setSelectedBooking} />
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
        />
      )}
    </div>
  );
}
