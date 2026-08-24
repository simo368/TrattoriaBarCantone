import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { bookingsStore } from '../../utils/localStore';
import { format, parseISO } from 'date-fns';

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
      
      <div className="toolbar mb-4">
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

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Stato</th>
              <th>Ora</th>
              <th>Nome</th>
              <th>Coperti</th>
              <th>Telefono / Note</th>
              <th style={{textAlign: 'right'}}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan="6" className="center text-muted py-4">Nessuna prenotazione trovata per questa data</td></tr>
            ) : (
              bookings.sort((a,b) => a.time.localeCompare(b.time)).map(b => (
                <tr key={b.id} style={{ opacity: b.status === 'cancelled' ? 0.6 : 1 }}>
                  <td>
                    {b.status === 'confirmed' ? <span className="badge badge-green">Confermata</span> : <span className="badge badge-red">Annullata</span>}
                  </td>
                  <td><strong>{b.time}</strong></td>
                  <td>{b.name}</td>
                  <td><strong>{b.guests}</strong></td>
                  <td>
                    <div>{b.phone}</div>
                    {b.notes && <div className="text-sm text-muted mt-2">"{b.notes}"</div>}
                  </td>
                  <td style={{textAlign: 'right'}}>
                    {b.status === 'confirmed' && (
                      <button className="btn btn-outline btn-sm" style={{marginRight: 8}} onClick={() => handleCancel(b.id)}>Annulla</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Elimina</button>
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
