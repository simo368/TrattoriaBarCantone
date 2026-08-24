import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSettings } from '../../hooks/useSettings';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import { Save, Store, Phone, Globe, BookOpen } from 'lucide-react';
import LoadingState from '../../components/admin/ui/LoadingState';

export default function Impostazioni() {
  const { settings, loading, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('ristorante');
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && !formData && !loading) {
      setFormData(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, loading, formData]);

  if (loading || !formData) return <LoadingState />;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Impostazioni aggiornate con successo');
    } catch (err) {
      toast.error('Errore durante il salvataggio');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedField = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const updateRootField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSave}>
      <PageHeader 
        title="Impostazioni Sito" 
        subtitle="Configura i dettagli aziendali, i contatti e le regole di prenotazione."
      >
        <ActionButton type="submit" variant="primary" icon={Save} disabled={isSaving}>
          {isSaving ? 'Salvataggio...' : 'Salva Tutte'}
        </ActionButton>
      </PageHeader>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--admin-border)', flexWrap: 'wrap' }}>
        <button type="button" className={`admin-tab ${activeTab === 'ristorante' ? 'active' : ''}`} onClick={() => setActiveTab('ristorante')}>
          <Store size={16} /> Ristorante
        </button>
        <button type="button" className={`admin-tab ${activeTab === 'contatti' ? 'active' : ''}`} onClick={() => setActiveTab('contatti')}>
          <Phone size={16} /> Contatti & Social
        </button>
        <button type="button" className={`admin-tab ${activeTab === 'prenotazioni' ? 'active' : ''}`} onClick={() => setActiveTab('prenotazioni')}>
          <BookOpen size={16} /> Regole Prenotazione
        </button>
        <button type="button" className={`admin-tab ${activeTab === 'sito' ? 'active' : ''}`} onClick={() => setActiveTab('sito')}>
          <Globe size={16} /> SEO & Sito
        </button>
      </div>

      <div className="admin-stat-card" style={{ padding: '24px' }}>
        
        {activeTab === 'ristorante' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Nome Ristorante</label>
              <input className="admin-input" required value={formData.businessName || ''} onChange={e => updateRootField('businessName', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Descrizione Pubblica (Chi siamo)</label>
              <textarea className="admin-input" rows="3" value={formData.description || ''} onChange={e => updateRootField('description', e.target.value)}></textarea>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: '16px 0 8px', fontSize: '1.1rem' }}>Indirizzo</h4>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Via e Civico</label>
              <input className="admin-input" value={formData.address?.street || ''} onChange={e => updateNestedField('address', 'street', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Città</label>
              <input className="admin-input" value={formData.address?.city || ''} onChange={e => updateNestedField('address', 'city', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Provincia (Sigla)</label>
              <input className="admin-input" value={formData.address?.province || ''} onChange={e => updateNestedField('address', 'province', e.target.value)} maxLength={2} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>CAP</label>
              <input className="admin-input" value={formData.address?.zip || ''} onChange={e => updateNestedField('address', 'zip', e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === 'contatti' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Telefono Principale</label>
              <input className="admin-input" value={formData.phone || ''} onChange={e => updateRootField('phone', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email</label>
              <input className="admin-input" type="email" value={formData.email || ''} onChange={e => updateRootField('email', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: '16px 0 8px', fontSize: '1.1rem' }}>Link Utili (Social e Maps)</h4>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Link WhatsApp</label>
              <input className="admin-input" placeholder="Es. https://wa.me/39..." value={formData.social?.whatsapp || ''} onChange={e => updateNestedField('social', 'whatsapp', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Link Instagram</label>
              <input className="admin-input" value={formData.social?.instagram || ''} onChange={e => updateNestedField('social', 'instagram', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Link Facebook</label>
              <input className="admin-input" value={formData.social?.facebook || ''} onChange={e => updateNestedField('social', 'facebook', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Link Tripadvisor</label>
              <input className="admin-input" value={formData.social?.tripadvisor || ''} onChange={e => updateNestedField('social', 'tripadvisor', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Link Google Maps</label>
              <input className="admin-input" value={formData.maps || ''} onChange={e => updateRootField('maps', e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === 'prenotazioni' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '600px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--admin-text-muted)' }}>
                Queste regole influenzano unicamente il comportamento del widget di prenotazione pubblico sul sito. Tu (Admin) puoi sempre forzare le prenotazioni dall'area Prenotazioni e Disponibilità.
              </p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Anticipo Minimo (Ore)</label>
              <input type="number" min="0" className="admin-input" value={formData.bookingRules?.minAdvanceHours || 0} onChange={e => updateNestedField('bookingRules', 'minAdvanceHours', Number(e.target.value))} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Es. "2" = Non si può prenotare per un orario che dista meno di 2 ore da adesso.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Orizzonte Massimo (Giorni)</label>
              <input type="number" min="1" className="admin-input" value={formData.bookingRules?.maxAdvanceDays || 60} onChange={e => updateNestedField('bookingRules', 'maxAdvanceDays', Number(e.target.value))} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Es. "60" = Il calendario pubblico permetterà di selezionare date fino a 60 giorni da oggi.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Numero Massimo Persone per Prenotazione Online</label>
              <input type="number" min="1" max="50" className="admin-input" value={formData.bookingRules?.maxPeoplePerBooking || 15} onChange={e => updateNestedField('bookingRules', 'maxPeoplePerBooking', Number(e.target.value))} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Oltre questo numero, il sito chiederà al cliente di contattarvi telefonicamente per gruppi numerosi.</p>
            </div>
          </div>
        )}

        {activeTab === 'sito' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Meta Titolo (SEO)</label>
              <input className="admin-input" value={formData.site?.title || ''} onChange={e => updateNestedField('site', 'title', e.target.value)} />
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Il titolo mostrato nella scheda del browser e nei risultati Google.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Meta Descrizione (SEO)</label>
              <textarea className="admin-input" rows="2" value={formData.site?.metaDescription || ''} onChange={e => updateNestedField('site', 'metaDescription', e.target.value)}></textarea>
              <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px' }}>Il riassunto testuale sotto il link blu di Google.</p>
            </div>
          </div>
        )}
        
      </div>
    </form>
  );
}
