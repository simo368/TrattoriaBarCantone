import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAdminBookingsList, adminCreateBooking, adminUpdateBooking } from '../../hooks/useAdminBookings';
import { updateBookingStatus, deleteBooking, BOOKING_STATUS } from '../../hooks/useBookings';
import { format, addDays, subDays } from 'date-fns';
import { Search, Plus, Filter, Mail, MailWarning, MailCheck } from 'lucide-react';

import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import FilterBar from '../../components/admin/ui/FilterBar';
import ActionButton from '../../components/admin/ui/ActionButton';
import { ConfirmDialog } from '../../components/admin/ui/Modal';
import StatusBadge from '../../components/admin/ui/StatusBadge';

import BookingDetailDrawer from '../../components/admin/bookings/BookingDetailDrawer';
import BookingFormModal from '../../components/admin/bookings/BookingFormModal';
import BookingCard from '../../components/admin/bookings/BookingCard';

export default function GestisciPrenotazioni() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    end: format(addDays(new Date(), 30), 'yyyy-MM-dd')
  });

  const { bookings, loading, error } = useAdminBookingsList(dateRange.start, dateRange.end);
  
  // Client-side Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState(''); // 'lunch', 'dinner'

  // Client-side Sorting
  const [sortKey, setSortKey] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals & Drawers
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formModal, setFormModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // --------------------------------------------------------
  // FILTERING & SORTING LOGIC
  // --------------------------------------------------------
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b => 
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q))
      );
    }

    if (statusFilter) {
      result = result.filter(b => b.status === statusFilter);
    }

    if (timeFilter) {
      result = result.filter(b => {
        const hour = parseInt(b.time.split(':')[0], 10);
        if (timeFilter === 'lunch') return hour < 16;
        if (timeFilter === 'dinner') return hour >= 16;
        return true;
      });
    }

    result.sort((a, b) => {
      let valA = a[sortKey] || '';
      let valB = b[sortKey] || '';

      if (sortKey === 'date' || sortKey === 'time') {
        valA = `${a.date}T${a.time}`;
        valB = `${b.date}T${b.time}`;
      } else if (sortKey === 'guests') {
        valA = Number(valA);
        valB = Number(valB);
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, search, statusFilter, timeFilter, sortKey, sortDirection]);

  // --------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      toast.success('Stato aggiornato');
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (err) {
      toast.error('Errore durante l\'aggiornamento dello stato');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteBooking(deleteModal.id);
      toast.success('Prenotazione eliminata definitivamente');
      if (selectedBooking?.id === deleteModal.id) setSelectedBooking(null);
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const handleSaveBooking = async (formData) => {
    try {
      if (formModal.data) {
        await adminUpdateBooking(formModal.data.id, formModal.data, formData);
        toast.success('Prenotazione aggiornata');
        if (selectedBooking?.id === formModal.data.id) {
          setSelectedBooking({ ...selectedBooking, ...formData });
        }
      } else {
        await adminCreateBooking(formData);
        toast.success('Nuova prenotazione creata');
      }
      // Il modale si chiuderà nel child component tramite onSuccess
    } catch (err) {
      if (err.message === 'SLOT_FULL') {
        toast.error('Capienza massima raggiunta per questo orario!');
      } else {
        toast.error('Errore durante il salvataggio');
      }
      throw err;
    }
  };

  // --------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------
  const getStatusMap = (status) => {
    const map = {
      [BOOKING_STATUS.PENDING]: { l: 'In attesa', s: 'warning' },
      [BOOKING_STATUS.CONFIRMED]: { l: 'Confermata', s: 'success' },
      [BOOKING_STATUS.ARRIVED]: { l: 'Arrivati', s: 'info' },
      [BOOKING_STATUS.COMPLETED]: { l: 'Completata', s: 'default' },
      [BOOKING_STATUS.CANCELLED]: { l: 'Annullata', s: 'danger' },
      [BOOKING_STATUS.NO_SHOW]: { l: 'No-Show', s: 'danger' }
    };
    return map[status] || { l: status, s: 'default' };
  };

  const renderEmailIcon = (status) => {
    if (status === 'sent') return <MailCheck size={14} color="var(--green-ok)" title="Email inviata" />;
    if (status === 'failed') return <MailWarning size={14} color="var(--red-danger)" title="Errore invio email" />;
    if (status === 'pending') return <Mail size={14} color="var(--admin-text-muted)" title="Email in attesa" />;
    return null;
  };

  const columns = [
    { 
      header: 'Data/Ora', 
      accessor: 'date', 
      sortable: true,
      cell: (row) => (
        <div style={{ opacity: row.status === BOOKING_STATUS.CANCELLED ? 0.6 : 1 }}>
          <strong style={{ display: 'block', fontSize: '1.05rem' }}>{format(new Date(row.date), 'dd/MM/yyyy')}</strong>
          <span style={{ color: 'var(--admin-text-muted)' }}>{row.time}</span>
        </div>
      ) 
    },
    { 
      header: 'Cliente', 
      accessor: 'name', 
      sortable: true,
      cell: (row) => (
        <div style={{ opacity: row.status === BOOKING_STATUS.CANCELLED ? 0.6 : 1 }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {row.name}
            {renderEmailIcon(row.emailStatus)}
          </strong>
          <span style={{ fontSize: '0.875rem', color: 'var(--admin-text-muted)' }}>{row.phone}</span>
        </div>
      )
    },
    { header: 'Coperti', accessor: 'guests', sortable: true },
    { 
      header: 'Stato', 
      accessor: 'status', 
      sortable: true,
      cell: (row) => {
        const smap = getStatusMap(row.status);
        return <StatusBadge status={smap.s} label={smap.l} />;
      }
    },
    { 
      header: '', 
      style: { textAlign: 'right' },
      cell: (row) => (
        <ActionButton size="sm" variant="outline" onClick={() => setSelectedBooking(row)}>
          Dettagli
        </ActionButton>
      ) 
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Gestione Prenotazioni" 
        subtitle="Ricerca, filtra e modifica le prenotazioni attive." 
      >
        <ActionButton icon={Plus} onClick={() => setFormModal({ isOpen: true, data: null })}>
          Nuova Prenotazione
        </ActionButton>
      </PageHeader>
      
      <FilterBar>
        {/* Firestore Query Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--admin-border)', paddingRight: '16px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-muted)' }}>Dal:</label>
          <input type="date" className="admin-input" style={{ width: '130px', padding: '6px 8px' }} value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--admin-text-muted)' }}>Al:</label>
          <input type="date" className="admin-input" style={{ width: '130px', padding: '6px 8px' }} value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
        </div>

        {/* Client Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
          <Search size={16} className="text-muted" />
          <input 
            type="text" 
            className="admin-input" 
            placeholder="Cerca nome, telefono, email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="admin-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Tutti gli stati</option>
            <option value={BOOKING_STATUS.PENDING}>In attesa</option>
            <option value={BOOKING_STATUS.CONFIRMED}>Confermata</option>
            <option value={BOOKING_STATUS.ARRIVED}>Arrivati</option>
            <option value={BOOKING_STATUS.COMPLETED}>Completata</option>
            <option value={BOOKING_STATUS.NO_SHOW}>No-Show</option>
            <option value={BOOKING_STATUS.CANCELLED}>Annullata</option>
          </select>

          <select className="admin-input" value={timeFilter} onChange={e => setTimeFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Tutti i turni</option>
            <option value="lunch">Pranzo</option>
            <option value="dinner">Cena</option>
          </select>
        </div>
      </FilterBar>

      {error && (
        <div style={{ padding: '16px', color: 'var(--admin-danger)', background: 'var(--admin-danger-light)', borderRadius: 'var(--admin-radius)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Desktop View (Table) */}
      <div className="hidden md:block">
        <DataTable 
          columns={columns} 
          data={filteredAndSortedBookings} 
          loading={loading} 
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyTitle="Nessuna prenotazione trovata" 
          emptyDescription="Prova a cambiare i filtri o l'intervallo di date." 
        />
      </div>

      {/* Mobile View (Cards) */}
      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Caricamento...</div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-text-muted)' }}>Nessuna prenotazione trovata.</div>
        ) : (
          filteredAndSortedBookings.map(b => (
            <BookingCard key={b.id} booking={b} onClick={setSelectedBooking} />
          ))
        )}
      </div>

      {/* Dettaglio (Drawer) */}
      <BookingDetailDrawer 
        isOpen={!!selectedBooking} 
        onClose={() => setSelectedBooking(null)} 
        booking={selectedBooking} 
        onStatusChange={handleStatusChange}
        onEdit={(b) => {
          setSelectedBooking(null);
          setFormModal({ isOpen: true, data: b });
        }}
      />

      {/* Form (Modal) */}
      <BookingFormModal 
        isOpen={formModal.isOpen} 
        onClose={() => setFormModal({ isOpen: false, data: null })} 
        initialData={formModal.data}
        onSave={handleSaveBooking}
        bookingsList={bookings} // Passiamo la lista per il calcolo delle disponibilità
      />

      {/* Confirm Delete (Non usato direttamente nella UI principale, ma disponibile se serve in futuro o dal Drawer) */}
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete} 
        title="Elimina Prenotazione" 
        message="Sei sicuro di voler eliminare DEFINITIVAMENTE questa prenotazione? Questa azione non può essere annullata." 
        confirmText="Elimina definitivamente" 
        isDanger={true}
      />
    </div>
  );
}
