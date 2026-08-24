import React from 'react';
import ActionButton from '../ui/ActionButton';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday }) {
  const monthName = format(currentDate, 'MMMM yyyy', { locale: it });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CalendarIcon size={24} style={{ color: 'var(--admin-primary)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{capitalizedMonth}</h2>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ActionButton variant="outline" size="sm" onClick={onPrevMonth} title="Mese precedente">
          <ChevronLeft size={18} />
        </ActionButton>
        <ActionButton variant="outline" size="sm" onClick={onToday}>
          Oggi
        </ActionButton>
        <ActionButton variant="outline" size="sm" onClick={onNextMonth} title="Mese successivo">
          <ChevronRight size={18} />
        </ActionButton>
      </div>
    </div>
  );
}
