import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cancelBooking } from '../hooks/useBookings';
import { bookingsStore } from '../utils/bookingsLocalStore';

export default function CancellaPrenotazione() {
  const { id } = useParams();
  const [status, setStatus] = useState(id ? 'loading' : 'error');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      try {
        await cancelBooking(id);
        if (!cancelled) setStatus('success');
      } catch {
        const local = bookingsStore.getAll().find(b => b.id === id);
        if (local) {
          bookingsStore.cancel(id);
          if (!cancelled) setStatus('success');
        } else if (!cancelled) {
          setStatus('error');
        }
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="booking-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="booking-card booking-wrapper" style={{ margin: '0 auto', textAlign: 'center' }}>
          <div className="booking-success">
            {status === 'loading' && (
              <>
                <Loader2 size={64} style={{ margin: '0 auto 16px', color: 'var(--forest)' }} />
                <h3>Cancellazione in corso…</h3>
                <p className="text-muted">Stiamo annullando la tua prenotazione.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="success-icon" style={{ color: 'var(--green-ok)' }}>
                  <CheckCircle2 size={64} style={{ margin: '0 auto 16px' }} />
                </div>
                <h3>Prenotazione cancellata</h3>
                <p>La tua prenotazione è stata annullata correttamente.</p>
                <br />
                <p className="text-muted">Se hai bisogno di un altro tavolo, puoi prenotare di nuovo in qualsiasi momento.</p>
                <br />
                <Link to="/prenota" className="btn btn-primary">Nuova prenotazione</Link>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="success-icon" style={{ color: 'var(--red, #c0392b)' }}>
                  <XCircle size={64} style={{ margin: '0 auto 16px' }} />
                </div>
                <h3>Impossibile cancellare</h3>
                <p>Non siamo riusciti ad annullare la prenotazione. Il link potrebbe non essere valido.</p>
                <br />
                <p className="text-muted">Contattaci per assistenza.</p>
                <br />
                <Link to="/contatti" className="btn btn-primary">Contatti</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
