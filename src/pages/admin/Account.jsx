import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { sendPasswordResetEmail } from 'firebase/auth';
import PageHeader from '../../components/admin/ui/PageHeader';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ActionButton from '../../components/admin/ui/ActionButton';
import { auth } from '../../firebase';

export default function Account() {
  const { user, role } = useAuth();
  const [sending, setSending] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Ti abbiamo inviato il link per scegliere una nuova password.');
    } catch {
      toast.error('Impossibile inviare il link. Riprova tra poco.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div>
      <PageHeader 
        title="Il tuo Account" 
        subtitle="Gestisci le credenziali di accesso al pannello." 
      />
      
      <div className="admin-stat-card admin-account-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Dettagli Profilo</h3>
        <div className="admin-account-row"><Mail size={18} /><span>{user?.email || 'Sconosciuta'}</span></div>
        <div className="admin-account-row"><ShieldCheck size={18} /><span>Ruolo: <strong>{role || 'Non assegnato'}</strong></span></div>
      </div>

      <ActionButton variant="outline" icon={KeyRound} loading={sending} onClick={handlePasswordReset}>
        Invia link per nuova password
      </ActionButton>
    </div>
  );
}
