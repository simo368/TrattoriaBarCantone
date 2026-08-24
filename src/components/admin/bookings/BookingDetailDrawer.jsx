import React from 'react';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';
import ActionButton from '../ui/ActionButton';
import { BOOKING_STATUS } from '../../../hooks/useBookings';
import { format, parseISO } from 'date-fns';
import { User, Phone, Mail, Calendar, Clock, Users, FileText, CheckCircle2, XCircle, ArrowRight, Ban, Edit2 } from 'lucide-react';

export default function BookingDetailDrawer({ isOpen, onClose, booking, onStatusChange, onEdit }) {
  if (!booking) return null;

  const renderActions = () => {
    switch (booking.status) {
      case BOOKING_STATUS.PENDING:
        return (
          <>
            <ActionButton variant="primary" icon={CheckCircle2} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.CONFIRMED)}>Conferma</ActionButton>
            <ActionButton variant="danger" icon={XCircle} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.CANCELLED)}>Annulla</ActionButton>
          </>
        );
      case BOOKING_STATUS.CONFIRMED:
        return (
          <>
            <ActionButton variant="primary" icon={ArrowRight} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.ARRIVED)}>Segna Arrivato</ActionButton>
            <ActionButton variant="danger" icon={XCircle} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.CANCELLED)}>Annulla</ActionButton>
            <ActionButton variant="outline" icon={Ban} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.NO_SHOW)}>No-Show</ActionButton>
          </>
        );
      case BOOKING_STATUS.ARRIVED:
        return (
          <ActionButton variant="primary" icon={CheckCircle2} onClick={() => onStatusChange(booking.id, BOOKING_STATUS.COMPLETED)}>Completato</ActionButton>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: { l: 'In attesa', s: 'warning' },
      confirmed: { l: 'Confermata', s: 'success' },
      arrived: { l: 'Arrivati', s: 'info' },
      completed: { l: 'Completata', s: 'default' },
      cancelled: { l: 'Annullata', s: 'danger' },
      no_show: { l: 'No-Show', s: 'danger' }
    };
    const mapped = map[status] || { l: status, s: 'default' };
    return <StatusBadge status={mapped.s} label={mapped.l} />;
  };

  const formattedCreatedAt = booking.createdAt?.toDate ? format(booking.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : 'N/D';
  const formattedUpdatedAt = booking.updatedAt?.toDate ? format(booking.updatedAt.toDate(), 'dd/MM/yyyy HH:mm') : '-';

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Dettagli Prenotazione</h2>
            {getStatusLabel(booking.status)}
          </div>
          <ActionButton variant="outline" icon={Edit2} onClick={() => onEdit(booking)}>Modifica</ActionButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
          
          <div className="admin-stat-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Cliente</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <User size={18} className="text-muted" />
              <strong style={{ fontSize: '1.1rem' }}>{booking.name}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Phone size={18} className="text-muted" />
              <span>{booking.phone}</span>
            </div>
            {booking.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} className="text-muted" />
                <a href={`mailto:${booking.email}`} style={{ color: 'var(--admin-primary)' }}>{booking.email}</a>
              </div>
            )}
          </div>

          <div className="admin-stat-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Prenotazione</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Calendar size={18} className="text-muted" />
              <span>{format(parseISO(booking.date), 'dd/MM/yyyy')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Clock size={18} className="text-muted" />
              <span>{booking.time}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={18} className="text-muted" />
              <span>{booking.guests} {booking.guests === 1 ? 'persona' : 'persone'}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="admin-stat-card" style={{ padding: '16px', background: 'var(--admin-warning-light)', borderColor: 'var(--admin-warning)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <FileText size={18} style={{ color: 'var(--admin-warning)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontStyle: 'italic', color: 'var(--admin-warning)' }}>{booking.notes}</span>
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: 'auto' }}>
            <p>Creata: {formattedCreatedAt} {booking.createdByAdmin ? '(Admin)' : '(Pubblico)'}</p>
            <p>Ultima modifica: {formattedUpdatedAt}</p>
            <p>ID: {booking.id}</p>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--admin-border)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {renderActions()}
        </div>
      </div>
    </Drawer>
  );
}
