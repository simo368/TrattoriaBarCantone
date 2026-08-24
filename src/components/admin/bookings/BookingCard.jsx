import React from 'react';
import StatusBadge from '../ui/StatusBadge';
import { Users, Mail, MailWarning, MailCheck } from 'lucide-react';
import { BOOKING_STATUS } from '../../../hooks/useBookings';

export default function BookingCard({ booking, onClick }) {
  const getStatusMap = (status) => {
    const map = {
      [BOOKING_STATUS.PENDING]: { l: 'In attesa', s: 'warning' },
      [BOOKING_STATUS.CONFIRMED]: { l: 'Confermata', s: 'success' },
      [BOOKING_STATUS.ARRIVED]: { l: 'Arrivati', s: 'info' },
      [BOOKING_STATUS.COMPLETED]: { l: 'Completata', s: 'default' },
      [BOOKING_STATUS.CANCELLED]: { l: 'Annullata', s: 'danger' },
      [BOOKING_STATUS.NO_SHOW]: { l: 'No-Show', s: 'danger' }
    };
    return map[status] || { l: status, s: 'default' };
  };

  const renderEmailIcon = (status) => {
    if (status === 'sent') return <MailCheck size={14} color="var(--green-ok)" title="Email inviata" />;
    if (status === 'failed') return <MailWarning size={14} color="var(--red-danger)" title="Errore invio email" />;
    if (status === 'pending') return <Mail size={14} color="var(--admin-text-muted)" title="Email in attesa" />;
    return null;
  };

  const smap = getStatusMap(booking.status);

  return (
    <div 
      className="admin-stat-card" 
      style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.2s', opacity: booking.status === BOOKING_STATUS.CANCELLED ? 0.6 : 1 }}
      onClick={() => onClick(booking)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <strong style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {booking.time} {renderEmailIcon(booking.emailStatus)}
          </strong>
          <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.875rem' }}>{booking.name}</span>
        </div>
        <StatusBadge status={smap.s} label={smap.l} />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
        <Users size={16} className="text-muted" /> {booking.guests}
      </div>
    </div>
  );
}
