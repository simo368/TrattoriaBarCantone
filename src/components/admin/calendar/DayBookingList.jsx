import React from 'react';
import BookingCard from '../bookings/BookingCard';
import EmptyState from '../ui/EmptyState';
import { CalendarX2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { BOOKING_STATUS } from '../../../hooks/useBookings';

export default function DayBookingList({ selectedDate, bookings, onBookingClick, isClosed }) {
  const dayStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTitle = format(selectedDate, 'EEEE d MMMM', { locale: it });
  const capitalizedTitle = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);

  const dayBookings = bookings.filter(b => b.date === dayStr);
  const activeBookings = dayBookings.filter(b => ![BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW].includes(b.status));
  const totalCovers = activeBookings.reduce((sum, booking) => sum + Number(booking.guests || 0), 0);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--admin-border)', backgroundColor: '#fafafa', borderRadius: 'var(--admin-radius) var(--admin-radius) 0 0' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{capitalizedTitle}</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
          {activeBookings.length} {activeBookings.length === 1 ? 'prenotazione attiva' : 'prenotazioni attive'} · {totalCovers} coperti
        </p>
      </div>

      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
        {isClosed ? (
          <EmptyState icon={CalendarX2} title="Giorno di chiusura" description="Il locale è chiuso in questa data." />
        ) : dayBookings.length === 0 ? (
          <EmptyState icon={CalendarX2} title="Nessuna prenotazione" description="Non ci sono prenotazioni per questa giornata." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dayBookings.map(b => (
              <BookingCard key={b.id} booking={b} onClick={onBookingClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
