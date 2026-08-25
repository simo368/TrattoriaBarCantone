import { useState, useMemo, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useBookings } from '../hooks/useBookings';
import { useSettings } from '../hooks/useSettings';
import { generateSlots, getAvailableSlots, isOpen } from '../utils/availability';
import { CheckCircle2, CalendarDays, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Prenota() {
  const { createBooking, bookings } = useBookings();
  const { settings } = useSettings();
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
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const selectedDate = useMemo(() => parseISO(formData.date), [formData.date]);
  
  // Usiamo direttamente le funzioni della nuova utils/availability
  const allSlots = useMemo(
    () => formData.date ? generateSlots(selectedDate, settings) : [],
    [selectedDate, settings]
  );

  // Limiti date per DatePicker nativo HTML5
  const maxAdvanceDays = settings.bookingRules?.maxAdvanceDays || 60;
  const maxPeople = settings.bookingRules?.maxPeoplePerBooking || 15;
  const todayStr = useMemo(() => format(now, 'yyyy-MM-dd'), [now]);
  const maxDateStr = useMemo(() => format(addDays(now, maxAdvanceDays), 'yyyy-MM-dd'), [now, maxAdvanceDays]);
  
  const isToday = formData.date === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const availableSlots = useMemo(() => {
    if (!formData.date) return [];
    const slots = getAvailableSlots(selectedDate, settings, bookings, formData.guests);
    
    // Filtro orari passati o non conformi al minAdvanceHours
    const minAdvanceHours = settings.bookingRules?.minAdvanceHours || 0;
    const minMinutes = (now.getHours() + minAdvanceHours) * 60 + now.getMinutes();

    if (!isToday) return slots;
    return slots.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      return (h * 60 + m) > minMinutes;
    });
  }, [selectedDate, settings, bookings, formData.guests, isToday, now, formData.date]);

  // Controlliamo se il ristorante è aperto per la data selezionata
  const isClosed = formData.date ? !isOpen(selectedDate, settings) : false;

  const handleNext = () => {
    if (step === 1 && (!formData.date || !formData.time)) return toast.error("Seleziona data e orario");
    if (step === 1 && isClosed) return toast.error("Il locale è chiuso in questa data");
    if (step === 1 && isToday) {
      const minAdvanceHours = settings.bookingRules?.minAdvanceHours || 0;
      const [h, m] = formData.time.split(':').map(Number);
      if ((h * 60 + m) <= (now.getHours() + minAdvanceHours) * 60 + now.getMinutes()) return toast.error("Orario non più disponibile");
    }
    if (step === 2 && !formData.guests) return toast.error("Seleziona il numero di persone");
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error("Nome e telefono obbligatori");
    
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.length < 8) {
      return toast.error("Inserisci un numero di telefono valido");
    }
    
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return toast.error("Inserisci un indirizzo email valido");
      }
    }
    if (isToday) {
      const [h, m] = formData.time.split(':').map(Number);
      if ((h * 60 + m) <= currentMinutes) return toast.error("Orario non più disponibile");
    }
    
    setSubmitting(true);
    try {
      await createBooking(formData, settings.maxCoversPerSlot);
      setCompleted(true);
    } catch (err) {
      const { getUserFriendlyError } = await import('../utils/errorHandler');
      const errorMsg = getUserFriendlyError(err, 'Prenotazione');
      toast.error(errorMsg);
      
      // Se l'errore è dovuto ai posti esauriti (o negato da rules), costringiamo a riselezionare l'orario
      if (err.code === 'permission-denied' || err.message === 'SLOT_FULL') {
        setFormData(prev => ({ ...prev, time: '' }));
        setStep(1); // Ritorna al primo step per visualizzare gli slot aggiornati
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="booking-page min-h-60vh flex-center">
        <div className="container">
          <div className="booking-card booking-wrapper mx-auto text-center">
            <div className="booking-success">
              <div className="success-icon text-green-ok">
                <CheckCircle2 size={64} className="mx-auto mb-3 block" />
              </div>
              <h3>Prenotazione Confermata!</h3>
              <p>Ti aspettiamo il <strong>{format(new Date(formData.date), 'dd/MM/yyyy')}</strong> alle ore <strong>{formData.time}</strong> per <strong>{formData.guests} persone</strong>.</p>
              <br/>
              <p className="text-muted">La tua prenotazione è stata inviata direttamente alla cucina in tempo reale.</p>
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
              <div className={`booking-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>Orario</div>
              <div className={`booking-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>Coperti</div>
              <div className={`booking-step ${step === 3 ? 'active' : ''}`}>Dati</div>
            </div>

            {/* STEP 1: Date & Time */}
            {step === 1 && (
              <div className="fade-in">
                <div className="form-group mb-4">
                  <label className="form-label">Data</label>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-12 top-13 text-muted" />
                    <input type="date" className="form-input pl-40"
                      min={todayStr} 
                      max={maxDateStr}
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value, time: ''})} 
                    />
                  </div>
                </div>
                
                <label className="form-label mb-2 block">Orari disponibili</label>
                {isClosed && (
                  <p className="text-muted text-center py-4">Il locale è chiuso in questa data.</p>
                )}
                {!isClosed && allSlots.length === 0 && (
                  <p className="text-muted text-center py-4">Nessun orario configurato per questa giornata.</p>
                )}
                {!isClosed && allSlots.length > 0 && availableSlots.length === 0 && (
                  <p className="text-muted text-center py-4">Tutti gli orari sono al completo per questa data.</p>
                )}
                {!isClosed && availableSlots.length > 0 && (
                  <div className="slots-grid mb-4">
                    {allSlots.map(slot => {
                      const isAvailable = availableSlots.includes(slot);
                      const [h, m] = slot.split(':').map(Number);
                      const isPast = isToday && ((h * 60 + m) <= currentMinutes);
                      const disabled = !isAvailable || isPast;
                      return (
                        <button 
                          key={slot} 
                          className={`slot-btn ${formData.time === slot ? 'selected' : ''} ${disabled ? 'full' : ''}`}
                          onClick={() => !disabled && setFormData({...formData, time: slot})}
                          disabled={disabled}
                        >{slot}</button>
                      );
                    })}
                  </div>
                )}

                <button className="btn btn-primary btn-full mt-4 flex-center gap-2" onClick={handleNext}>
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
                  <div className="relative">
                    <Users size={18} className="absolute left-12 top-13 text-muted" />
                    <div className="form-group">
                      <select className="form-select pl-40" value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})}>
                        {[...Array(maxPeople)].map((_, i) => (
                          <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'Persona' : 'Persone'}</option>
                        ))}
                      </select>
                      <div className="text-xs mt-1 text-slate">
                        Oltre {maxPeople} persone contattateci telefonicamente.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button className="btn btn-outline flex-1 flex-center gap-2" onClick={() => setStep(1)}>
                    <ArrowLeft size={18} /> Indietro
                  </button>
                  <button className="btn btn-primary flex-2 flex-center gap-2" onClick={handleNext}>
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
                  <button type="button" className="btn btn-outline flex-1 flex-center gap-2" onClick={() => setStep(2)}>
                    <ArrowLeft size={18} /> Indietro
                  </button>
                  <button type="submit" className="btn btn-primary flex-2 flex-center gap-2" disabled={submitting}>
                    {submitting ? "Invio in corso..." : "Conferma Prenotazione"}
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
