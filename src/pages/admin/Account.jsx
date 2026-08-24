import React from 'react';
import PageHeader from '../../components/admin/ui/PageHeader';
import EmptyState from '../../components/admin/ui/EmptyState';
import { User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ActionButton from '../../components/admin/ui/ActionButton';

export default function Account() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageHeader 
        title="Il tuo Account" 
        subtitle="Gestisci le credenziali di accesso al pannello." 
      />
      
      <div className="admin-stat-card" style={{ maxWidth: '400px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Dettagli Profilo</h3>
        <p style={{ color: 'var(--admin-text-muted)', marginBottom: '8px' }}>
          <strong>Email:</strong> {user?.email || 'Sconosciuta'}
        </p>
        <p style={{ color: 'var(--admin-text-muted)' }}>
          <strong>Stato:</strong> Autenticato (Admin)
        </p>
      </div>

      <ActionButton variant="outline">Cambia Password</ActionButton>
    </div>
  );
}
