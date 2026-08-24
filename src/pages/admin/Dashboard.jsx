import { useAdmin } from '../../contexts/AdminContext';
import { format } from 'date-fns';
import { Users, CalendarDays, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { bookings: allBookings, loading } = useAdmin();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayBookings = allBookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const upcomingBookings = allBookings.filter(b => b.date > todayStr && b.status !== 'cancelled');
  
  const todayCovers = todayBookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);
  const upcomingCovers = upcomingBookings.reduce((sum, b) => sum + (Number(b.guests) || 0), 0);

  return (
    <div>
      <h1 className="page-title">Panoramica (In Tempo Reale)</h1>
      
      <div className="stat-grid">
        <div className="stat-card">
          <div className="flex justify-between items-center mb-2">
            <div className="stat-label" style={{ margin: 0 }}>Coperti oggi</div>
            <Users size={20} className="text-muted" />
          </div>
          <div className="stat-value">{loading ? '...' : todayCovers}</div>
        </div>
        
        <div className="stat-card">
          <div className="flex justify-between items-center mb-2">
            <div className="stat-label" style={{ margin: 0 }}>Prenotazioni oggi</div>
            <CalendarDays size={20} className="text-muted" />
          </div>
          <div className="stat-value">{loading ? '...' : todayBookings.length}</div>
        </div>
        
        <div className="stat-card">
          <div className="flex justify-between items-center mb-2">
            <div className="stat-label" style={{ margin: 0 }}>Coperti futuri</div>
            <TrendingUp size={20} className="text-muted" />
          </div>
          <div className="stat-value" style={{color: 'var(--brick)'}}>{loading ? '...' : upcomingCovers}</div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div style={{padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <CalendarDays size={18} />
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
            {loading ? (
              <tr><td colSpan="4" className="center text-muted py-4">Connessione a Firestore...</td></tr>
            ) : todayBookings.length === 0 ? (
              <tr><td colSpan="4" className="center text-muted py-4">Nessuna prenotazione per oggi</td></tr>
            ) : (
              todayBookings.sort((a,b) => (a.time || '').localeCompare(b.time || '')).map(b => (
                <tr key={b.id}>
                  <td><strong>{b.time}</strong></td>
                  <td>{b.name}</td>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                      <Users size={14} className="text-muted" />
                      {b.guests}
                    </div>
                  </td>
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
