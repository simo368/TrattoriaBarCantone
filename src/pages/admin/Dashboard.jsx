import { bookingsStore } from '../../utils/localStore';
import { format } from 'date-fns';

export default function Dashboard() {
  const allBookings = bookingsStore.getAll();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayBookings = allBookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const upcomingBookings = allBookings.filter(b => b.date > todayStr && b.status !== 'cancelled');
  
  const todayCovers = todayBookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const upcomingCovers = upcomingBookings.reduce((sum, b) => sum + (b.guests || 0), 0);

  return (
    <div>
      <h1 className="page-title">Panoramica</h1>
      
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{todayCovers}</div>
          <div className="stat-label">Coperti oggi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{todayBookings.length}</div>
          <div className="stat-label">Prenotazioni oggi</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: 'var(--brick)'}}>{upcomingCovers}</div>
          <div className="stat-label">Coperti futuri</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div style={{padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 'bold'}}>
          Prenotazioni di Oggi ({format(new Date(), 'dd/MM/yyyy')})
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ora</th>
              <th>Nome</th>
              <th>Coperti</th>
              <th>Telefono</th>
            </tr>
          </thead>
          <tbody>
            {todayBookings.length === 0 ? (
              <tr><td colSpan="4" className="center text-muted py-4">Nessuna prenotazione per oggi</td></tr>
            ) : (
              todayBookings.sort((a,b) => a.time.localeCompare(b.time)).map(b => (
                <tr key={b.id}>
                  <td><strong>{b.time}</strong></td>
                  <td>{b.name}</td>
                  <td>{b.guests}</td>
                  <td>{b.phone}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
