import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../../hooks/useSettings';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import { Save, Clock, Users, CalendarX, Plus, Trash2 } from 'lucide-react';
import LoadingState from '../../components/admin/ui/LoadingState';

const WEEKDAYS = [
  { key: 'Mon', label: 'Lunedì' },
  { key: 'Tue', label: 'Martedì' },
  { key: 'Wed', label: 'Mercoledì' },
  { key: 'Thu', label: 'Giovedì' },
  { key: 'Fri', label: 'Venerdì' },
  { key: 'Sat', label: 'Sabato' },
  { key: 'Sun', label: 'Domenica' }
];

export default function Disponibilita() {
  const { settings, loading, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('orari');
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !formData && !loading) {
      setFormData({
        schedule: JSON.parse(JSON.stringify(settings.hours?.schedule || {})),
        slotInterval: settings.slotInterval || 30,
        maxCoversPerSlot: settings.maxCoversPerSlot || 40,
        maxCoversPerService: settings.maxCoversPerService || 120,
        specialDays: JSON.parse(JSON.stringify(settings.specialDays || [])),
        blocks: JSON.parse(JSON.stringify(settings.blocks || []))
      });
    }
  }, [settings, loading, formData]);

  if (loading || !formData) return <LoadingState />;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        hours: {
          ...settings.hours,
          schedule: formData.schedule,
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        slotInterval: formData.slotInterval,
        maxCoversPerSlot: formData.maxCoversPerSlot,
        maxCoversPerService: formData.maxCoversPerService,
        specialDays: formData.specialDays,
        blocks: formData.blocks
      });
      toast.success('Impostazioni salvate con successo');
    } catch (err) {
      toast.error('Errore durante il salvataggio');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSchedule = (day, index, field, value) => {
    const newSchedule = { ...formData.schedule };
    if (!newSchedule[day]) newSchedule[day] = [];
    newSchedule[day][index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addPeriod = (day) => {
    const newSchedule = { ...formData.schedule };
    if (!newSchedule[day]) newSchedule[day] = [];
    newSchedule[day].push({ open: '12:00', close: '15:00' });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removePeriod = (day, index) => {
    const newSchedule = { ...formData.schedule };
    newSchedule[day].splice(index, 1);
    setFormData({ ...formData, schedule: newSchedule });
  };

  const toggleDayStatus = (day) => {
    const newSchedule = { ...formData.schedule };
    if (!newSchedule[day] || newSchedule[day].length === 0) {
      // Apri
      newSchedule[day] = [{ open: '12:00', close: '15:00' }];
    } else {
      // Chiudi
      newSchedule[day] = [];
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  const addSpecialDay = () => {
    setFormData({
      ...formData,
      specialDays: [...formData.specialDays, { date: '', closed: true, schedule: [] }]
    });
  };

  const removeSpecialDay = (index) => {
    const newSpecial = [...formData.specialDays];
    newSpecial.splice(index, 1);
    setFormData({ ...formData, specialDays: newSpecial });
  };

  const addBlock = () => {
    setFormData({
      ...formData,
      blocks: [...formData.blocks, { date: '', time: 'all', reason: '' }]
    });
  };

  const removeBlock = (index) => {
    const newBlocks = [...formData.blocks];
    newBlocks.splice(index, 1);
    setFormData({ ...formData, blocks: newBlocks });
  };

  return (
    <div>
      <PageHeader 
        title="Disponibilità e Orari" 
        subtitle="Configura quando il ristorante è aperto e le capacità massime per prenotazione."
      >
        <ActionButton variant="primary" icon={Save} onClick={handleSave} loading={isSaving}>
          {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
        </ActionButton>
      </PageHeader>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)' }}>
        <button className={`admin-tab ${activeTab === 'orari' ? 'active' : ''}`} onClick={() => setActiveTab('orari')}>
          <Clock size={16} /> Orari e Chiusure
        </button>
        <button className={`admin-tab ${activeTab === 'eccezioni' ? 'active' : ''}`} onClick={() => setActiveTab('eccezioni')}>
          <CalendarX size={16} /> Blocchi Speciali
        </button>
        <button className={`admin-tab ${activeTab === 'capacita' ? 'active' : ''}`} onClick={() => setActiveTab('capacita')}>
          <Users size={16} /> Avanzate (Capacità)
        </button>
      </div>

      {activeTab === 'orari' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-stat-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Orario Settimanale Regolare</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {WEEKDAYS.map(({ key, label }) => {
                const periods = formData.schedule[key] || [];
                const isClosed = periods.length === 0;
                
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr', gap: '16px', alignItems: 'flex-start', borderBottom: '1px solid var(--admin-border)', paddingBottom: '16px' }}>
                    <div style={{ fontWeight: '600', paddingTop: '8px' }}>{label}</div>
                    
                    <div style={{ paddingTop: '8px' }}>
                      <span 
                        onClick={() => toggleDayStatus(key)}
                        style={{ 
                          display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                          backgroundColor: isClosed ? 'var(--admin-danger-light)' : 'var(--admin-success-light)',
                          color: isClosed ? 'var(--admin-danger)' : 'var(--admin-success)'
                        }}
                      >
                        {isClosed ? 'CHIUSO' : 'APERTO'}
                      </span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {!isClosed && (
                        <>
                          {periods.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <input type="time" className="admin-input" value={p.open} onChange={e => updateSchedule(key, i, 'open', e.target.value)} />
                              <span>-</span>
                              <input type="time" className="admin-input" value={p.close} onChange={e => updateSchedule(key, i, 'close', e.target.value)} />
                              <ActionButton size="sm" variant="outline" icon={Trash2} onClick={() => removePeriod(key, i)} />
                            </div>
                          ))}
                          <div>
                            <ActionButton size="sm" variant="outline" icon={Plus} onClick={() => addPeriod(key)}>
                              Aggiungi fascia oraria
                            </ActionButton>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="admin-stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Giorni Speciali (Chiusure intere)</h3>
              <ActionButton size="sm" icon={Plus} onClick={addSpecialDay}>Aggiungi Chiusura</ActionButton>
            </div>
            
            {formData.specialDays.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Nessuna chiusura straordinaria configurata.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formData.specialDays.map((sd, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fafafa', padding: '16px', borderRadius: 'var(--admin-radius)' }}>
                    <input type="date" className="admin-input" value={sd.date} onChange={e => {
                      const newSd = [...formData.specialDays]; newSd[i].date = e.target.value; setFormData({...formData, specialDays: newSd});
                    }} />
                    <span style={{ fontWeight: 600, color: 'var(--admin-danger)' }}>CHIUSO</span>
                    <ActionButton variant="danger" size="sm" icon={Trash2} onClick={() => removeSpecialDay(i)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'eccezioni' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="admin-stat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Blocco Servizi (No Prenotazioni)</h3>
              <ActionButton size="sm" icon={Plus} onClick={addBlock}>Aggiungi Blocco</ActionButton>
            </div>
            <p style={{ color: 'var(--admin-text-muted)', marginBottom: '16px' }}>Impedisce nuove prenotazioni in un determinato turno, ma non segnala il ristorante come chiuso.</p>
            
            {formData.blocks.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)' }}>Nessun blocco configurato.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formData.blocks.map((blk, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fafafa', padding: '16px', borderRadius: 'var(--admin-radius)' }}>
                    <input type="date" className="admin-input" value={blk.date} onChange={e => {
                      const newB = [...formData.blocks]; newB[i].date = e.target.value; setFormData({...formData, blocks: newB});
                    }} />
                    <select className="admin-input" value={blk.time} onChange={e => {
                      const newB = [...formData.blocks]; newB[i].time = e.target.value; setFormData({...formData, blocks: newB});
                    }} style={{ width: '150px' }}>
                      <option value="all">Tutto il giorno</option>
                      <option value="lunch">Solo Pranzo</option>
                      <option value="dinner">Solo Cena</option>
                    </select>
                    <input type="text" className="admin-input" placeholder="Motivo (es. Completo, Evento privato)" value={blk.reason} onChange={e => {
                      const newB = [...formData.blocks]; newB[i].reason = e.target.value; setFormData({...formData, blocks: newB});
                    }} style={{ flex: 1 }} />
                    <ActionButton variant="danger" size="sm" icon={Trash2} onClick={() => removeBlock(i)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === 'capacita' && (
        <div className="admin-stat-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Limiti di Capacità</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '600px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Intervallo Slot (minuti)</label>
              <select className="admin-input" value={formData.slotInterval} onChange={e => setFormData({...formData, slotInterval: Number(e.target.value)})}>
                <option value={15}>15 minuti</option>
                <option value={30}>30 minuti</option>
                <option value={60}>60 minuti</option>
              </select>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Ogni quanti minuti viene offerta la prenotazione nel modulo pubblico.</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Capacità Massima per Slot (Coperti)</label>
              <input type="number" min="1" className="admin-input" value={formData.maxCoversPerSlot} onChange={e => setFormData({...formData, maxCoversPerSlot: Number(e.target.value)})} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Massimo numero di persone prenotabili nello stesso esatto orario (es. alle 20:00).</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Capacità Massima per Servizio (Pranzo/Cena)</label>
              <input type="number" min="1" className="admin-input" value={formData.maxCoversPerService} onChange={e => setFormData({...formData, maxCoversPerService: Number(e.target.value)})} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Massimo numero totale di persone servite per tutto il turno (capacità globale del locale).</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
