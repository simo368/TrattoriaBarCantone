import { useState } from 'react';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingsStore } from '../utils/localStore';
import { CheckCircle2, CalendarDays, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Prenota() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    guests: 2,
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [completed, setCompleted] = useState(false);

  const availableSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  const handleNext = () => {
    if (step === 1 && (!formData.date || !formData.time)) return toast.error("Seleziona data e orario");
    if (step === 2 && !formData.guests) return toast.error("Seleziona il numero di persone");
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error("Nome e telefono obbligatori");
    bookingsStore.add(formData);
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="booking-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="booking-card booking-wrapper" style={{ margin: '0 auto', textAlign: 'center' }}>
            <div className="booking-success">
              <div className="success-icon" style={{color: 'var(--green-ok)'}}>
                <CheckCircle2 size={64} style={{ margin: '0 auto 16px' }} />
              </div>
              <h3>Prenotazione Confermata!</h3>
              <p>Ti aspettiamo il <strong>{format(new Date(formData.date), 'dd/MM/yyyy')}</strong> alle ore <strong>{formData.time}</strong> per <strong>{formData.guests} persone</strong>.</p>
              <br/>
              <p className="text-muted">A breve riceverai un'email di riepilogo all'indirizzo {formData.email || 'fornito'}.</p>
              <br/>
              <Link to="/" className="btn btn-primary">Torna alla Home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="container">
          <h1>Prenota il tuo tavolo</h1>
          <p>Conferma immediata. Semplice e veloce.</p>
        </div>
      </div>

      <div className="container">
        <div className="booking-wrapper">
          <div className="booking-card">
            
            <div className="booking-steps">
              <div className={`booking-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
                 Orario
              </div>
              <div className={`booking-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
                 Coperti
              </div>
              <div className={`booking-step ${step === 3 ? 'active' : ''}`}>
                 Dati
              </div>
            </div>

            {/* STEP 1: Date & Time */}
            {step === 1 && (
              <div className="fade-in">
                <div className="form-group mb-4">
                  <label className="form-label">Data</label>
                  <div style={{ position: 'relative' }}>
                    <CalendarDays size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--muted)' }} />
                    <input type="date" className="form-input" style={{ paddingLeft: '40px' }}
                      min={format(new Date(), 'yyyy-MM-dd')} 
                      max={format(addDays(new Date(), 60), 'yyyy-MM-dd')}
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value, time: ''})} 
                    />
                  </div>
                </div>
                
                <label className="form-label mb-2" style={{display:'block'}}>Orari disponibili</label>
                <div className="slots-grid mb-4">
                  {availableSlots.map(slot => (
                    <button 
                      key={slot} 
                      className={`slot-btn ${formData.time === slot ? 'selected' : ''}`}
                      onClick={() => setFormData({...formData, time: slot})}
                    >{slot}</button>
                  ))}
                </div>

                <button className="btn btn-primary btn-full mt-4" onClick={handleNext}>
                  Continua <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 2: Guests */}
            {step === 2 && (
              <div className="fade-in">
                <div className="booking-summary">
                  <dt>Data e Ora</dt>
                  <dd>{format(new Date(formData.date), 'dd/MM/yyyy')} alle {formData.time}</dd>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Numero di persone</label>
                  <div style={{ position: 'relative' }}>
                    <Users size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--muted)' }} />
                    <select className="form-select" style={{ paddingLeft: '40px' }} value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}>
                      {[...Array(20)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1} {i===0 ? 'persona' : 'persone'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button className="btn btn-outline flex-1" style={{flex: 1}} onClick={() => setStep(1)}>
                    <ArrowLeft size={18} /> Indietro
                  </button>
                  <button className="btn btn-primary flex-2" style={{flex: 2}} onClick={handleNext}>
                    Continua <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Details */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="fade-in">
                <div className="booking-summary mb-4">
                  <dt>Riepilogo</dt>
                  <dd>{formData.guests} persone — {format(new Date(formData.date), 'dd/MM/yyyy')} alle {formData.time}</dd>
                </div>

                <div className="booking-form-grid mb-4">
                  <div className="form-group">
                    <label className="form-label">Nome e Cognome *</label>
                    <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefono *</label>
                    <input type="tel" className="form-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Email (opzionale)</label>
                  <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Per ricevere la conferma" />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label">Note / Allergie (opzionale)</label>
                  <textarea className="form-textarea" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setStep(2)}>
                    <ArrowLeft size={18} /> Indietro
                  </button>
                  <button type="submit" className="btn btn-primary" style={{flex: 2}}>
                    Conferma Prenotazione
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
