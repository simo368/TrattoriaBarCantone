import React from 'react';
import BookingCard from '../bookings/BookingCard';
import EmptyState from '../ui/EmptyState';
import { CalendarX2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function DayBookingList({ selectedDate, bookings, onBookingClick, isClosed }) {
  const dayStr = format(selectedDate, 'yyyy-MM-dd');
  const dayTitle = format(selectedDate, 'EEEE d MMMM', { locale: it });
  const capitalizedTitle = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);

  const dayBookings = bookings.filter(b => b.date === dayStr);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 'var(--admin-radius)', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--admin-border)', backgroundColor: '#fafafa', borderRadius: 'var(--admin-radius) var(--admin-radius) 0 0' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{capitalizedTitle}</h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>
          {dayBookings.length} {dayBookings.length === 1 ? 'prenotazione' : 'prenotazioni'}
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
