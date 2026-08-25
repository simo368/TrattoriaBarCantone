import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../../hooks/useSettings';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import { Save, Clock, Users, CalendarX, Plus, Trash2, CalendarDays } from 'lucide-react';
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
      toast.success('Le disponibilità sono state salvate correttamente.');
    } catch (err) {
      toast.error('Errore durante il salvataggio. Riprova.');
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
      // Imposta un orario di default quando si riapre un giorno
      newSchedule[day] = [{ open: '12:00', close: '15:00' }];
    } else {
      // Chiudi il giorno
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
        subtitle="Configura i giorni di apertura, i turni del ristorante e la capienza massima per le prenotazioni."
      >
        <ActionButton variant="primary" icon={Save} onClick={handleSave} loading={isSaving}>
          {isSaving ? 'Salvataggio...' : 'Salva Tutte le Modifiche'}
        </ActionButton>
      </PageHeader>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap' }}>
        <button className={`admin-tab ${activeTab === 'orari' ? 'active' : ''}`} onClick={() => setActiveTab('orari')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} /> <span>Orari Standard</span>
        </button>
        <button className={`admin-tab ${activeTab === 'eccezioni' ? 'active' : ''}`} onClick={() => setActiveTab('eccezioni')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarDays size={18} /> <span>Chiusure & Festività</span>
        </button>
        <button className={`admin-tab ${activeTab === 'capacita' ? 'active' : ''}`} onClick={() => setActiveTab('capacita')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} /> <span>Limiti Coperti</span>
        </button>
      </div>

      {activeTab === 'orari' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--admin-text-main)' }}>Orari della settimana</h3>
            <p style={{ color: 'var(--admin-text-muted)', marginBottom: '24px' }}>Definisci i turni in cui accetti prenotazioni nei giorni normali. Se un giorno è segnato come CHIUSO, non sarà possibile prenotare.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', overflow: 'hidden' }}>
              {WEEKDAYS.map(({ key, label }, index) => {
                const periods = formData.schedule[key] || [];
                const isClosed = periods.length === 0;
                
                return (
                  <div key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start', padding: '24px', borderBottom: index < WEEKDAYS.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                    
                    <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{label}</strong>
                      <span 
                        onClick={() => toggleDayStatus(key)}
                        style={{ 
                          display: 'inline-block', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                          backgroundColor: isClosed ? 'var(--admin-danger-light)' : 'var(--admin-success-light)',
                          color: isClosed ? 'var(--admin-danger)' : 'var(--admin-success)',
                          border: `1px solid ${isClosed ? 'var(--admin-danger)' : 'var(--admin-success)'}`
                        }}
                      >
                        {isClosed ? 'GIORNO DI CHIUSURA' : 'APERTO'}
                      </span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {isClosed ? (
                        <div style={{ color: 'var(--admin-text-muted)', padding: '8px 0', fontSize: '0.9rem' }}>Nessun turno configurato.</div>
                      ) : (
                        <>
                          {periods.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--admin-text-muted)', width: '60px' }}>Turno {i + 1}</span>
                              <input type="time" className="admin-input" style={{ width: '130px' }} value={p.open} onChange={e => updateSchedule(key, i, 'open', e.target.value)} />
                              <span style={{ color: 'var(--admin-text-muted)' }}>fino alle</span>
                              <input type="time" className="admin-input" style={{ width: '130px' }} value={p.close} onChange={e => updateSchedule(key, i, 'close', e.target.value)} />
                              <ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => removePeriod(key, i)} title="Elimina questo turno" />
                            </div>
                          ))}
                          <div style={{ marginTop: '8px' }}>
                            <ActionButton size="sm" variant="outline" icon={Plus} onClick={() => addPeriod(key)}>
                              Aggiungi un altro turno
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
        </div>
      )}

      {activeTab === 'eccezioni' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '800px' }}>
          
          {/* Sezione Chiusure Intere */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: 'var(--admin-text-main)' }}>Chiusure Straordinarie Intere</h3>
                <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>Date specifiche in cui il locale è chiuso tutto il giorno (es. ferie, festività speciali).</p>
              </div>
              <ActionButton icon={Plus} onClick={addSpecialDay}>Aggiungi Chiusura</ActionButton>
            </div>
            
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '24px' }}>
              {formData.specialDays.length === 0 ? (
                <div style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '24px 0' }}>Nessuna chiusura straordinaria inserita.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.specialDays.map((sd, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="date" className="admin-input" style={{ width: '200px' }} value={sd.date} onChange={e => {
                        const newSd = [...formData.specialDays]; newSd[i].date = e.target.value; setFormData({...formData, specialDays: newSd});
                      }} />
                      <span style={{ fontWeight: 600, color: 'var(--admin-danger)', padding: '6px 12px', background: 'var(--admin-danger-light)', borderRadius: '4px', fontSize: '0.8rem' }}>CHIUSO TUTTO IL GIORNO</span>
                      <ActionButton variant="danger" size="sm" icon={Trash2} onClick={() => removeSpecialDay(i)}>Rimuovi</ActionButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sezione Blocchi Singoli */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', color: 'var(--admin-text-main)' }}>Blocchi Prenotazioni (Locale Aperto)</h3>
                <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>Usa questa opzione per fermare temporaneamente le prenotazioni in un turno specifico (es. sala già piena per evento), pur mantenendo il locale ufficialmente "aperto".</p>
              </div>
              <ActionButton icon={Plus} onClick={addBlock}>Aggiungi Blocco</ActionButton>
            </div>
            
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '24px' }}>
              {formData.blocks.length === 0 ? (
                <div style={{ color: 'var(--admin-text-muted)', textAlign: 'center', padding: '24px 0' }}>Nessun blocco temporaneo inserito.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.blocks.map((blk, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input type="date" className="admin-input" style={{ width: '160px' }} value={blk.date} onChange={e => {
                        const newB = [...formData.blocks]; newB[i].date = e.target.value; setFormData({...formData, blocks: newB});
                      }} />
                      <select className="admin-input" style={{ width: '180px' }} value={blk.time} onChange={e => {
                        const newB = [...formData.blocks]; newB[i].time = e.target.value; setFormData({...formData, blocks: newB});
                      }}>
                        <option value="all">Tutto il giorno (Pranzo e Cena)</option>
                        <option value="lunch">Solo Pranzo</option>
                        <option value="dinner">Solo Cena</option>
                      </select>
                      <input type="text" className="admin-input" placeholder="Motivo (Es. Matrimonio, Sala Piena)" value={blk.reason} onChange={e => {
                        const newB = [...formData.blocks]; newB[i].reason = e.target.value; setFormData({...formData, blocks: newB});
                      }} style={{ flex: 1, minWidth: '200px' }} />
                      <ActionButton variant="danger" size="sm" icon={Trash2} onClick={() => removeBlock(i)}>Rimuovi</ActionButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      
      {activeTab === 'capacita' && (
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--admin-text-main)' }}>Limiti di Sicurezza (Coperti)</h3>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '32px' }}>Definisci quante persone puoi servire contemporaneamente per evitare l'overbooking.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '32px' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--admin-text-main)' }}>Intervallo di Prenotazione</label>
              <select className="admin-input" value={formData.slotInterval} onChange={e => setFormData({...formData, slotInterval: Number(e.target.value)})}>
                <option value={15}>Mostra orari ogni 15 minuti (es. 19:00, 19:15, 19:30)</option>
                <option value={30}>Mostra orari ogni 30 minuti (es. 19:00, 19:30, 20:00)</option>
                <option value={60}>Mostra orari ogni 60 minuti (es. 19:00, 20:00, 21:00)</option>
              </select>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '8px' }}>Determina la frequenza degli orari proposti al cliente nel sito.</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--admin-text-main)' }}>Capacità per Singolo Orario (Es. alle 20:00)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="1" className="admin-input" style={{ width: '120px' }} value={formData.maxCoversPerSlot} onChange={e => setFormData({...formData, maxCoversPerSlot: Number(e.target.value)})} />
                <span style={{ color: 'var(--admin-text-muted)' }}>persone totali ammesse per lo stesso orario</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '8px' }}>Utile per non far arrivare 50 persone tutte nello stesso momento, scaglionando gli arrivi.</p>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--admin-text-main)' }}>Capacità Globale per Turno (Pranzo o Cena intero)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="number" min="1" className="admin-input" style={{ width: '120px' }} value={formData.maxCoversPerService} onChange={e => setFormData({...formData, maxCoversPerService: Number(e.target.value)})} />
                <span style={{ color: 'var(--admin-text-muted)' }}>persone servibili nell'intero turno</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '8px' }}>Raggiunta questa cifra, il sistema non accetterà più prenotazioni per quel servizio indipendentemente dall'orario.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
