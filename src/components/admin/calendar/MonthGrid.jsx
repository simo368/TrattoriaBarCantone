import React from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday
} from 'date-fns';
import { BOOKING_STATUS } from '../../../hooks/useBookings';
import { isOpen } from '../../../utils/availability';

export default function MonthGrid({ currentDate, selectedDate, onSelectDate, bookings, settings }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  // Calcolo statistiche per ogni giorno
  const getDayStats = (dayStr) => {
    const dayBookings = bookings.filter(b => b.date === dayStr && b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.NO_SHOW);
    if (dayBookings.length === 0) return null;

    const covers = dayBookings.reduce((sum, b) => sum + Number(b.guests || 0), 0);
    return { count: dayBookings.length, covers };
  };

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: 'var(--admin-radius)', 
      border: '1px solid var(--admin-border)',
      overflow: 'hidden'
    }}>
      {/* Header giorni settimana */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        borderBottom: '1px solid var(--admin-border)',
        backgroundColor: '#fafafa'
      }}>
        {weekDays.map(d => (
          <div key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Griglia giorni */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((day, i) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const isClosed = !isOpen(day, settings);
          const stats = getDayStats(dayStr);
          
          // Layout del singolo giorno
          return (
            <button
              type="button"
              className="admin-calendar-day"
              key={dayStr}
              onClick={() => onSelectDate(day)}
              aria-label={`${format(day, 'd MMMM')}${stats ? `, ${stats.count} prenotazioni e ${stats.covers} coperti` : ''}${isClosed ? ', locale chiuso' : ''}`}
              style={{
                minHeight: '100px',
                padding: '8px',
                borderBottom: '1px solid var(--admin-border)',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--admin-border)' : 'none',
                backgroundColor: isSelected ? 'var(--admin-primary-light)' : (isCurrentMonth ? '#fff' : '#fafafa'),
                opacity: isCurrentMonth ? 1 : 0.4,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
              onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = isCurrentMonth ? '#fff' : '#fafafa'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '24px', 
                  height: '24px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: isDayToday ? 700 : (isSelected ? 600 : 400),
                  backgroundColor: isDayToday ? 'var(--admin-primary)' : 'transparent',
                  color: isDayToday ? '#fff' : (isSelected ? 'var(--admin-primary-dark)' : 'inherit')
                }}>
                  {format(day, 'd')}
                </span>
                
                {isClosed && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-danger)', backgroundColor: 'var(--admin-danger-light)', padding: '2px 6px', borderRadius: '4px' }}>CHIUSO</span>
                )}
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {stats && !isClosed && (
                  <>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      color: stats.covers >= (Number(settings.maxCoversPerSlot || 40) * 1.8) ? 'var(--admin-danger)' : 'var(--admin-text)', 
                      backgroundColor: stats.covers >= (Number(settings.maxCoversPerSlot || 40) * 1.8) ? 'var(--admin-danger-light)' : '#f0fdf4', 
                      border: stats.covers >= (Number(settings.maxCoversPerSlot || 40) * 1.8) ? '1px solid var(--admin-danger)' : '1px solid #bbf7d0', 
                      padding: '2px 4px', 
                      borderRadius: '4px', 
                      textAlign: 'center' 
                    }}>
                      {stats.count} Pren.
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)', backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', textAlign: 'center' }}>
                      {stats.covers} Pax
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
