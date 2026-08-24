import React, { useState, useMemo } from 'react';
import { 
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameDay 
} from 'date-fns';
import PageHeader from '../../components/admin/ui/PageHeader';
import CalendarHeader from '../../components/admin/calendar/CalendarHeader';
import MonthGrid from '../../components/admin/calendar/MonthGrid';
import DayBookingList from '../../components/admin/calendar/DayBookingList';
import BookingDetailDrawer from '../../components/admin/bookings/BookingDetailDrawer';
import { useAdminBookingsList } from '../../hooks/useAdminBookings';
import { updateBookingStatus } from '../../hooks/useBookings';
import { useSettings } from '../../hooks/useSettings';
import toast from 'react-hot-toast';

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { settings } = useSettings();
  const closedDays = settings.hours?.closedDays || [];

  // Calcoliamo il range di date da scaricare per la griglia del mese corrente
  const queryStart = format(startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const queryEnd = format(endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { bookings, loading, error } = useAdminBookingsList(queryStart, queryEnd);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

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

  // Selezionando un giorno aggiorno anche il mese visualizzato se il giorno cliccato è di un altro mese
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    if (format(date, 'yyyy-MM') !== format(currentDate, 'yyyy-MM')) {
      setCurrentDate(date);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Calendario Prenotazioni" 
        subtitle="Visualizza l'andamento mensile e i dettagli giornalieri."
      />

      {error && (
        <div style={{ padding: '16px', color: 'var(--admin-danger)', background: 'var(--admin-danger-light)', borderRadius: 'var(--admin-radius)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Layout: su Desktop il calendario a sinistra e i dettagli a destra. Su Mobile uno sotto l'altro. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="xl:flex-row">
        
        {/* Sinistra: Calendario Mensile */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
          <CalendarHeader 
            currentDate={currentDate} 
            onPrevMonth={handlePrevMonth} 
            onNextMonth={handleNextMonth} 
            onToday={handleToday} 
          />
          
          <div style={{ position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-muted">Caricamento...</span>
              </div>
            )}
            <MonthGrid 
              currentDate={currentDate} 
              selectedDate={selectedDate} 
              onSelectDate={handleSelectDate} 
              bookings={bookings} 
              closedDays={closedDays}
            />
          </div>
        </div>

        {/* Destra: Dettaglio Giorno */}
        <div style={{ flex: '1', minWidth: '320px' }}>
          <DayBookingList 
            selectedDate={selectedDate} 
            bookings={bookings} 
            onBookingClick={setSelectedBooking} 
            isClosed={closedDays.includes(format(selectedDate, 'yyyy-MM-dd'))}
          />
        </div>

      </div>

      <BookingDetailDrawer 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        booking={selectedBooking} 
        onStatusChange={handleStatusChange}
        onEdit={() => {
          // Opzionale: per modificare dal calendario si potrebbe aprire il form modal qui,
          // ma per mantenere il calendario semplice, potremmo consigliare di usare la pagina prenotazioni,
          // o implementare il formModal anche in questa view.
          toast.info("Per modificare data/ora, usa la vista Prenotazioni.");
        }}
      />
    </div>
  );
}
