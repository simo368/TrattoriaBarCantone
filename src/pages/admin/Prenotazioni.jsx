import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { bookingsStore } from '../../utils/localStore';
import { format } from 'date-fns';
import { Users, Phone, FileText, CheckCircle2, XCircle, Search, Trash2, CalendarDays } from 'lucide-react';

export default function GestisciPrenotazioni() {
  const [bookings, setBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    refreshBookings();
  }, [dateFilter]);

  const refreshBookings = () => {
    const all = bookingsStore.getAll();
    setBookings(all.filter(b => b.date === dateFilter));
  };

  const handleCancel = (id) => {
    if (window.confirm('Vuoi annullare questa prenotazione?')) {
      bookingsStore.cancel(id);
      toast.success('Prenotazione annullata');
      refreshBookings();
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Eliminare definitivamente dal database?')) {
      bookingsStore.delete(id);
      toast.success('Prenotazione eliminata');
      refreshBookings();
    }
  };

  return (
    <div>
      <h1 className="page-title">Gestione Prenotazioni</h1>
      
      <div className="toolbar mb-4" style={{ background: '#fff', padding: '16px', borderRadius: 'var(--r)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <Search size={18} className="text-muted" />
          <label className="form-label" style={{margin:0}}>Filtra per data:</label>
          <input 
            type="date" 
            className="form-input" 
            style={{width: 200}} 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)} 
          />
          <button className="btn btn-outline btn-sm" onClick={() => setDateFilter(format(new Date(), 'yyyy-MM-dd'))}>Oggi</button>
        </div>
      </div>

      <div className="admin-table-wrap">
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
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="center text-muted py-4">
                  <div style={{ padding: '40px 0' }}>
                    <CalendarDays size={48} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                    <p>Nessuna prenotazione per questa data</p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.sort((a,b) => a.time.localeCompare(b.time)).map(b => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
