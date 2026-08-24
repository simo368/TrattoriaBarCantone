import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import LoadingState from '../../components/admin/ui/LoadingState';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { UserCog } from 'lucide-react';

export default function Utenti() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Solo OWNER può accedere a questa pagina
  if (role !== 'OWNER') {
    return <Navigate to="/admin" />;
  }

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Ruolo aggiornato con successo');
    } catch (err) {
      toast.error('Errore durante l\'aggiornamento del ruolo');
      console.error(err);
    }
  };

  const columns = [
    { 
      header: 'Email / Utente', 
      accessor: 'email',
      cell: (row) => <strong>{row.email || row.id}</strong>
    },
    { 
      header: 'Ruolo Attuale', 
      cell: (row) => {
        let badgeType = 'default';
        if (row.role === 'OWNER') badgeType = 'warning';
        if (row.role === 'MANAGER') badgeType = 'success';
        return <StatusBadge status={badgeType} label={row.role || 'Sconosciuto'} />;
      }
    },
    { 
      header: 'Modifica Ruolo', 
      style: { textAlign: 'right' },
      cell: (row) => (
        <select 
          className="admin-input" 
          style={{ width: 'auto', display: 'inline-block', padding: '4px 8px' }}
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          disabled={row.role === 'OWNER' && users.filter(u => u.role === 'OWNER').length <= 1} // Previene la rimozione dell'ultimo owner
        >
          <option value="OWNER">OWNER</option>
          <option value="MANAGER">MANAGER</option>
          <option value="STAFF">STAFF</option>
        </select>
      ) 
    }
  ];

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader 
        title="Gestione Sicurezza (RBAC)" 
        subtitle="Gestisci i ruoli e i permessi del tuo staff (Solo OWNER)."
      />

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--admin-border)', marginBottom: '24px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><UserCog size={20} color="var(--admin-primary)"/> Livelli di Accesso</h4>
        <ul style={{ paddingLeft: '20px', color: 'var(--admin-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li><strong>OWNER</strong>: Accesso totale al sistema e alla gestione dei ruoli (questa pagina).</li>
          <li><strong>MANAGER</strong>: Accesso a prenotazioni, menù, galleria, impostazioni e orari. Non può gestire la sicurezza.</li>
          <li><strong>STAFF</strong>: Accesso limitato <em>esclusivamente</em> alla visualizzazione e modifica delle prenotazioni (per i camerieri).</li>
        </ul>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        emptyTitle="Nessun utente trovato" 
      />
    </div>
  );
}
