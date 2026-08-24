import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import ActionButton from '../ui/ActionButton';
import { generateSlots, getAvailableSlots } from '../../../utils/availability';
import { useSettings } from '../../../hooks/useSettings';
import { parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function BookingFormModal({ isOpen, onClose, onSave, initialData, bookingsList }) {
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        date: initialData.date || '',
        time: initialData.time || '',
        guests: initialData.guests || 2,
        notes: initialData.notes || '',
      });
    } else if (isOpen) {
      setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: '' });
    }
  }, [isOpen, initialData]);

  const selectedDate = useMemo(() => formData.date ? parseISO(formData.date) : null, [formData.date]);
  
  const { isOpen } = require('../../../utils/availability');
  const isClosed = selectedDate ? !isOpen(selectedDate, settings) : false;

  const allSlots = useMemo(
    () => (selectedDate && !isClosed) ? generateSlots(selectedDate, settings) : [],
    [selectedDate, settings, isClosed]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDate || isClosed) return [];
    
    // Escludiamo la prenotazione *corrente* (se in edit) dal calcolo
    const relevantBookings = bookingsList.filter(b => b.id !== initialData?.id);
    
    return getAvailableSlots(selectedDate, settings, relevantBookings, formData.guests);
  }, [selectedDate, settings, bookingsList, isClosed, initialData?.id, formData.guests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isTimeAvailable = availableSlots.includes(formData.time);
  // Se sto in Edit e non tocco niente, il tempo originale è valido anche se lo slot è tecnicamente esaurito ora? 
  // No, getAvailableSlots con l'esclusione della booking corrente restituisce la disponibilità netta.
  
  const canSave = formData.name && formData.phone && formData.date && formData.time && isTimeAvailable && formData.guests > 0;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Modifica Prenotazione" : "Nuova Prenotazione"}
      footer={
        <>
          <ActionButton variant="outline" onClick={onClose} disabled={submitting}>Annulla</ActionButton>
          <ActionButton onClick={handleSubmit} disabled={!canSave || submitting}>
            {submitting ? <Loader2 size={18} className="animate-spin" /> : "Salva"}
          </ActionButton>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Data *</label>
            <input type="date" className="admin-input" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value, time: ''})} disabled={submitting} />
          </div>
          <div>
            <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Coperti *</label>
            <input type="number" min="1" max="30" className="admin-input" required value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})} disabled={submitting} />
          </div>
        </div>

        <div>
            <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Orario *</label>
            {!formData.date ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>Seleziona una data per vedere gli orari.</div>
            ) : isClosed ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--admin-danger)' }}>Il locale è chiuso in questa data.</div>
            ) : allSlots.length === 0 ? (
              <div style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>Nessun orario configurato.</div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {allSlots.map(slot => {
                  const isAvailable = availableSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isAvailable || submitting}
                      className={`admin-btn admin-btn-sm ${formData.time === slot ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                      style={{ opacity: isAvailable ? 1 : 0.5, textDecoration: isAvailable ? 'none' : 'line-through' }}
                      onClick={() => setFormData({...formData, time: slot})}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        <div>
          <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Nome Cliente *</label>
          <input className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={submitting} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Telefono *</label>
            <input type="tel" className="admin-input" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={submitting} />
          </div>
          <div>
            <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Email</label>
            <input type="email" className="admin-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={submitting} />
          </div>
        </div>

        <div>
          <label className="admin-text-muted" style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Note</label>
          <textarea className="admin-input" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={submitting}></textarea>
        </div>

      </form>
    </Modal>
  );
}
