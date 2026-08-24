import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAllBookings, useBookings } from '../../hooks/useBookings';
import { format, isToday, isFuture, isPast, addDays, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Users, Phone, FileText, CheckCircle2, XCircle, Trash2, CalendarDays } from 'lucide-react';

export default function GestisciPrenotazioni() {
  const { bookings: allBookings, loading } = useAllBookings();
  const { cancelBooking, deleteBooking } = useBookings(); // We need these functions to edit/delete
  
  const [filterMode, setFilterMode] = useState('upcoming'); // 'today', 'upcoming', 'all'

  const handleCancel = async (id) => {
    if (window.confirm('Vuoi annullare questa prenotazione?')) {
      try {
        await cancelBooking(id);
        toast.success('Prenotazione annullata');
      } catch (err) {
        toast.error("Errore durante l'operazione");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Eliminare definitivamente dal database?')) {
      try {
        await deleteBooking(id);
        toast.success('Prenotazione eliminata');
      } catch (err) {
        toast.error("Errore durante l'eliminazione");
      }
    }
  };

  // Filter bookings based on active tab
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  let displayedBookings = allBookings;
  if (filterMode === 'today') {
    displayedBookings = allBookings.filter(b => b.date === todayStr);
  } else if (filterMode === 'upcoming') {
    displayedBookings = allBookings.filter(b => b.date >= todayStr);
  }

  // Group by date
  const grouped = displayedBookings.reduce((acc, booking) => {
    if (!acc[booking.date]) acc[booking.date] = [];
    acc[booking.date].push(booking);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <h1 className="page-title">Tutte le Prenotazioni</h1>
      
      <div className="toolbar mb-4" style={{ background: '#fff', padding: '12px 16px', borderRadius: 'var(--r)', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', gap: '8px' }}>
        <button 
          className={`filter-btn ${filterMode === 'today' ? 'active' : ''}`}
          onClick={() => setFilterMode('today')}
        >
          Solo Oggi
        </button>
        <button 
          className={`filter-btn ${filterMode === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterMode('upcoming')}
        >
          Prossime (Oggi + Future)
        </button>
        <button 
          className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          Storico Completo
        </button>
      </div>

      {loading ? (
        <div className="center text-muted py-4">Sincronizzazione prenotazioni dal Cloud...</div>
      ) : sortedDates.length === 0 ? (
        <div className="center text-muted py-4">
          <div style={{ padding: '40px 0' }}>
            <CalendarDays size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p>Nessuna prenotazione trovata per il filtro selezionato.</p>
          </div>
        </div>
      ) : (
        sortedDates.map(dateStr => {
          const dateBookings = grouped[dateStr].sort((a,b) => (a.time || '').localeCompare(b.time || ''));
          const formattedDate = format(parseISO(dateStr), "EEEE d MMMM yyyy", { locale: it });
          const isDateToday = dateStr === todayStr;

          return (
            <div key={dateStr} className="admin-table-wrap mb-4">
              <div style={{
                padding: '12px 20px', 
                borderBottom: '2px solid var(--primary)', 
                background: isDateToday ? '#e8f5e9' : '#f8f9fa',
                fontWeight: 'bold', 
                fontSize: '1.1rem',
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                textTransform: 'capitalize'
              }}>
                <CalendarDays size={20} style={{color: 'var(--primary)'}} />
                {isDateToday ? `OGGI - ${formattedDate}` : formattedDate}
                <span className="badge badge-gray" style={{marginLeft: 'auto'}}>{dateBookings.length} prenotazioni</span>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Stato</th>
                    <th>Ora</th>
                    <th>Nome</th>
                    <th>Coperti</th>
                    <th>Contatti / Note</th>
                    <th style={{textAlign: 'right'}}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {dateBookings.map(b => (
                    <tr key={b.id} style={{ opacity: b.status === 'cancelled' ? 0.6 : 1, transition: 'all 0.2s' }}>
                      <td>
                        {b.status === 'confirmed' ? (
                          <span className="badge badge-green"><CheckCircle2 size={12} /> Confermata</span>
                        ) : (
                          <span className="badge badge-red"><XCircle size={12} /> Annullata</span>
                        )}
                      </td>
                      <td><strong style={{ fontSize: '1.1rem' }}>{b.time}</strong></td>
                      <td><strong>{b.name}</strong></td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'}}>
                          <Users size={16} className="text-muted" /> {b.guests}
                        </div>
                      </td>
                      <td>
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'}}>
                          <Phone size={14} className="text-muted" /> {b.phone}
                        </div>
                        {b.notes && (
                          <div className="text-sm text-muted mt-2" style={{display: 'flex', alignItems: 'flex-start', gap: '6px'}}>
                            <FileText size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontStyle: 'italic' }}>{b.notes}</span>
                          </div>
                        )}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {b.status === 'confirmed' && (
                          <button className="btn btn-outline btn-sm" style={{marginRight: 8}} onClick={() => handleCancel(b.id)}>Annulla</button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)} title="Elimina definitivamente">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
