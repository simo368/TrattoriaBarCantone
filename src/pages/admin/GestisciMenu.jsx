import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMenu } from '../../hooks/useMenu';
import { Plus, Edit2, Trash2, Eye, EyeOff, Ban, GripVertical, Star, ImageIcon } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import DataTable from '../../components/admin/ui/DataTable';
import ActionButton from '../../components/admin/ui/ActionButton';
import FilterBar from '../../components/admin/ui/FilterBar';
import Modal, { ConfirmDialog } from '../../components/admin/ui/Modal';
import StatusBadge from '../../components/admin/ui/StatusBadge';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function GestisciMenu() {
  const { menu, loading, addDish, updateDish, deleteDish, reorderMenu, CATEGORIES } = useMenu();
  const [activeCat, setActiveCat] = useState('primi');
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', desc: '', price: '', category: '', 
    active: true, soldOut: false, recommended: false, 
    allergens: '', image: '' 
  });
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [orderedDishes, setOrderedDishes] = useState([]);
  
  // Stati per Drag & Drop
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  // Stati per Upload Immagine
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

  // Quando cambia il menu o la categoria, aggiorniamo la lista ordinata locale
  useEffect(() => {
    const dishes = Array.isArray(menu) ? menu.filter(m => m.category === activeCat) : (menu[activeCat] || []);
    // Ordiniamo in base al campo 'order'
    dishes.sort((a, b) => (a.order || 0) - (b.order || 0));
    setOrderedDishes(dishes);
  }, [menu, activeCat]);

  // DRAG & DROP HANDLERS
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    // Rende un po' trasparente la riga trascinata
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1';
    setIsDragging(false);
    
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    if (dragItem.current === dragOverItem.current) return;

    // Crea copia della lista e scambia elementi
    const newList = [...orderedDishes];
    const dragItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, dragItemContent);
    
    // Aggiorna l'indice 'order' per tutti
    const reorderedItems = newList.map((item, index) => ({ id: item.id, order: index }));
    
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    
    // Aggiornamento ottimistico locale
    setOrderedDishes(newList.map((item, index) => ({ ...item, order: index })));
    
    // Salvataggio su Firestore in batch
    try {
      await reorderMenu(reorderedItems);
      toast.success('Ordine aggiornato');
    } catch (err) {
      toast.error('Errore nel salvare l\'ordine');
    }
  };

  // UPLOAD IMMAGINE
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      return toast.error("Formato non supportato. Usa JPG, PNG o WEBP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Il file è troppo grande (Max 5MB).");
    }

    const storageRef = ref(storage, `menu/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setIsUploading(true);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        setIsUploading(false);
        toast.error("Errore durante l'upload");
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setEditForm(prev => ({ ...prev, image: downloadURL }));
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Immagine caricata!");
      }
    );
  };

  const handleEdit = (dish) => {
    setIsEditing(dish.id);
    setEditForm({ 
      ...dish, 
      recommended: dish.recommended || false, 
      allergens: dish.allergens || '',
      image: dish.image || ''
    });
  };

  const handleNew = () => {
    setIsEditing('new');
    setEditForm({ 
      name: '', desc: '', price: '', category: activeCat, 
      active: true, soldOut: false, recommended: false, 
      allergens: '', image: ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing === 'new') {
        await addDish(editForm.category, editForm);
        toast.success('Piatto aggiunto');
      } else {
        await updateDish(isEditing, editForm);
        toast.success('Piatto aggiornato');
      }
      setIsEditing(null);
    } catch (err) {
      toast.error("Errore salvataggio menù");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDish(deleteModal.id);
      toast.success('Piatto eliminato');
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error("Errore durante l'eliminazione");
    }
  };

  const toggleActive = async (dish) => {
    try {
      await updateDish(dish.id, { active: !dish.active });
      toast.success(dish.active ? 'Piatto disattivato (nascosto)' : 'Piatto attivato (visibile)');
    } catch {
      toast.error("Errore");
    }
  };

  const toggleSoldOut = async (dish) => {
    try {
      await updateDish(dish.id, { soldOut: !dish.soldOut });
      toast.success(dish.soldOut ? 'Piatto di nuovo disponibile' : 'Piatto segnato come esaurito');
    } catch {
      toast.error("Errore");
    }
  };

  const columns = [
    {
      header: '',
      style: { width: '40px', textAlign: 'center', color: 'var(--admin-text-muted)' },
      cell: () => <GripVertical size={16} style={{ cursor: 'grab' }} />
    },
    { 
      header: 'Piatto', 
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: row.active === false ? 0.6 : 1 }}>
          {row.image ? (
            <img src={row.image} alt={row.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <ImageIcon size={20} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '1.05rem' }}>{row.name}</strong>
              {row.recommended && <Star size={14} fill="#eab308" color="#eab308" title="Consigliato" />}
            </div>
            {row.allergens && <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Allergeni: {row.allergens}</div>}
          </div>
        </div>
      )
    },
    { 
      header: 'Prezzo', 
      cell: (row) => (
        <strong style={{ opacity: row.active === false ? 0.6 : 1 }}>
          {row.price ? `${row.price} €` : '-'}
        </strong>
      )
    },
    { 
      header: 'Disponibilità (Visibile al Pubblico)', 
      cell: (row) => (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: row.active ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>
            <input 
              type="checkbox" 
              checked={row.active !== false} // default true if undefined
              onChange={() => toggleActive(row)} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--admin-success)' }}
            />
            {row.active !== false ? 'Nel Menù' : 'Nascosto'}
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: row.soldOut ? 'var(--admin-warning)' : 'var(--admin-text-muted)' }}>
            <input 
              type="checkbox" 
              checked={!!row.soldOut} 
              onChange={() => toggleSoldOut(row)} 
              style={{ width: '16px', height: '16px', accentColor: 'var(--admin-warning)' }}
            />
            {row.soldOut ? 'Esaurito' : 'Disponibile'}
          </label>
        </div>
      ) 
    },
    { 
      header: 'Azioni', 
      style: { textAlign: 'right' },
      cell: (row) => row.id && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <ActionButton size="sm" variant="outline" onClick={() => handleEdit(row)}>
            <Edit2 size={14} />
          </ActionButton>
          <ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ isOpen: true, id: row.id })} />
        </div>
      ) 
    }
  ];

  return (
    <div>
      <PageHeader title="Gestione Menù" subtitle="Riordina (Drag&Drop), aggiungi immagini e configura i piatti.">
        <ActionButton icon={Plus} onClick={handleNew}>Aggiungi Piatto</ActionButton>
      </PageHeader>

      <FilterBar>
        <span className="admin-text-muted" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Categorie:</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <ActionButton 
              key={cat} 
              variant={activeCat === cat ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveCat(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ActionButton>
          ))}
        </div>
      </FilterBar>

      <DataTable 
        columns={columns} 
        data={orderedDishes} 
        loading={loading} 
        emptyTitle="Nessun piatto" 
        emptyDescription={`Non ci sono piatti nella categoria ${activeCat}.`}
        rowProps={(row, index) => ({
          draggable: true,
          onDragStart: (e) => handleDragStart(e, index),
          onDragEnter: (e) => handleDragEnter(e, index),
          onDragEnd: handleDragEnd,
          onDragOver: (e) => e.preventDefault(),
          style: { cursor: isDragging ? 'grabbing' : 'default', transition: 'background-color 0.2s' }
        })}
      />

      <Modal 
        isOpen={!!isEditing} 
        onClose={() => setIsEditing(null)} 
        title={isEditing === 'new' ? 'Nuovo Piatto' : 'Modifica Piatto'}
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setIsEditing(null)}>Annulla</ActionButton>
            <ActionButton onClick={handleSave} disabled={isUploading}>Salva in Cloud</ActionButton>
          </>
        }
      >
        <form id="dishForm" onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {editForm.image ? (
              <img src={editForm.image} alt="Anteprima" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon color="#94a3b8" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Immagine Piatto</label>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem' }} />
              {isUploading && <div style={{ fontSize: '0.75rem', color: 'var(--admin-primary)' }}>Caricamento: {Math.round(uploadProgress)}%</div>}
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Nome *</label>
            <input className="admin-input" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Categoria *</label>
            <select className="admin-input" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Prezzo (€)</label>
            <input type="number" step="0.5" className="admin-input" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Descrizione / Ingredienti</label>
            <textarea className="admin-input" rows="2" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}></textarea>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Allergeni</label>
            <input className="admin-input" placeholder="Es. Glutine, Lattosio, Frutta a guscio..." value={editForm.allergens} onChange={e => setEditForm({...editForm, allergens: e.target.value})} />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', marginTop: '8px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} />
              Attivo nel menu
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={editForm.soldOut} onChange={e => setEditForm({...editForm, soldOut: e.target.checked})} />
              Esaurito
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--admin-warning)' }}>
              <input type="checkbox" checked={editForm.recommended} onChange={e => setEditForm({...editForm, recommended: e.target.checked})} />
              Consigliato (Stella)
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete} 
        title="Elimina Piatto" 
        message="Sei sicuro di voler eliminare questo piatto? Questa azione non può essere annullata." 
        confirmText="Elimina" 
        isDanger={true}
      />
    </div>
  );
}
