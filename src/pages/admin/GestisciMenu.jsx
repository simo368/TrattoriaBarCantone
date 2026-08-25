import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMenu } from '../../hooks/useMenu';
import { Plus, Edit2, Trash2, Eye, EyeOff, Ban, GripVertical, Star, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import FilterBar from '../../components/admin/ui/FilterBar';
import Modal, { ConfirmDialog } from '../../components/admin/ui/Modal';
import LoadingState from '../../components/admin/ui/LoadingState';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function GestisciMenu() {
  const { menu, loading, addDish, updateDish, deleteDish, reorderMenu, CATEGORIES } = useMenu();
  const [activeCat, setActiveCat] = useState('primi');
  
  // Modals state
  const [isEditing, setIsEditing] = useState(null); // 'new' or dish.id
  const [editForm, setEditForm] = useState({ 
    name: '', desc: '', price: '', category: '', 
    active: true, soldOut: false, recommended: false, 
    allergens: '', image: '' 
  });
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [orderedDishes, setOrderedDishes] = useState([]);
  
  // Drag & Drop state
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const categories = CATEGORIES || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];

  // Initialize active category fallback
  useEffect(() => {
    if (!categories.includes(activeCat) && categories.length > 0) {
      setActiveCat(categories[0]);
    }
  }, [categories, activeCat]);

  // Update local ordered list when menu or category changes
  useEffect(() => {
    if (!menu) return;
    const dishes = Array.isArray(menu) ? menu.filter(m => m.category === activeCat) : (menu[activeCat] || []);
    dishes.sort((a, b) => (a.order || 0) - (b.order || 0));
    setOrderedDishes(dishes);
  }, [menu, activeCat]);

  // DRAG & DROP
  const handleDragStart = (e, position) => {
    dragItem.current = position;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.4'; }, 0);
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1';
    setIsDragging(false);
    
    if (dragItem.current === undefined || dragOverItem.current === undefined) return;
    if (dragItem.current === dragOverItem.current) return;

    const newList = [...orderedDishes];
    const dragItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, dragItemContent);
    
    const reorderedItems = newList.map((item, index) => ({ id: item.id, order: index }));
    
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    
    setOrderedDishes(newList.map((item, index) => ({ ...item, order: index })));
    
    try {
      await reorderMenu(reorderedItems);
      toast.success('Ordine del menù salvato');
    } catch (err) {
      toast.error("Errore nel salvataggio dell'ordine");
    }
  };

  // UPLOAD IMMAGINE PIATTO
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
        toast.success("Immagine piatto caricata!");
      }
    );
  };

  // MODIFICA & CREAZIONE
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
    
    // Validazione robusta
    if (!editForm.name.trim()) return toast.error("Il nome del piatto è obbligatorio.");
    if (!editForm.category) return toast.error("Seleziona una categoria valida.");
    if (editForm.price && isNaN(editForm.price)) return toast.error("Il prezzo inserito non è valido.");
    if (Number(editForm.price) < 0) return toast.error("Il prezzo non può essere negativo.");

    try {
      if (isEditing === 'new') {
        await addDish(editForm.category, editForm);
        toast.success('Nuovo piatto salvato');
      } else {
        await updateDish(isEditing, editForm);
        toast.success('Piatto aggiornato correttamente');
      }
      setIsEditing(null);
    } catch (err) {
      toast.error("Errore salvataggio modifiche");
    }
  };

  // ELIMINAZIONE
  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDish(deleteModal.id);
      toast.success('Piatto eliminato definitivamente');
      setDeleteModal({ isOpen: false, id: null });
    } catch (err) {
      toast.error("Errore durante l'eliminazione");
    }
  };

  // AZIONI RAPIDE
  const toggleActive = async (dish) => {
    try {
      await updateDish(dish.id, { active: !dish.active });
      toast.success(dish.active ? 'Piatto nascosto dal menù pubblico' : 'Piatto nuovamente visibile');
    } catch {
      toast.error("Errore durante l'aggiornamento dello stato");
    }
  };

  const toggleSoldOut = async (dish) => {
    try {
      await updateDish(dish.id, { soldOut: !dish.soldOut });
      toast.success(dish.soldOut ? 'Piatto segnato come disponibile' : 'Piatto segnato come esaurito');
    } catch {
      toast.error("Errore durante l'aggiornamento dello stato");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Gestione Menù" subtitle="Riordina i piatti trascinandoli, aggiorna i prezzi e segna le disponibilità.">
        <ActionButton icon={Plus} onClick={handleNew}>Aggiungi Piatto</ActionButton>
      </PageHeader>

      <FilterBar>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text-main)' }}>Categoria:</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '4px' }}>
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

      {/* LISTA PIATTI (NO CARD, NO TABLE OVERFLOW) */}
      {orderedDishes.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed var(--admin-border)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--admin-text)' }}>Nessun piatto presente</h3>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '24px' }}>Non ci sono piatti nella categoria {activeCat}.</p>
          <ActionButton icon={Plus} onClick={handleNew}>Aggiungi il primo piatto</ActionButton>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orderedDishes.map((dish, index) => (
            <div 
              key={dish.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                padding: '16px', backgroundColor: '#fff', borderRadius: '8px', 
                border: '1px solid var(--admin-border)', cursor: isDragging ? 'grabbing' : 'grab',
                opacity: dish.active === false ? 0.6 : 1, transition: 'opacity 0.2s'
              }}
            >
              <div style={{ color: '#cbd5e1', cursor: 'grab', flexShrink: 0 }}>
                <GripVertical size={20} />
              </div>
              
              <div style={{ width: '48px', height: '48px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={20} color="#94a3b8" />
                )}
              </div>
              
              <div style={{ flex: '1 1 250px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--admin-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dish.name}
                  </strong>
                  {dish.price && <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--admin-primary)' }}>€ {Number(dish.price).toFixed(2)}</span>}
                  
                  {/* Status Badges */}
                  {dish.soldOut && <span style={{ fontSize: '0.7rem', background: 'var(--admin-warning-light)', color: 'var(--admin-warning)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>ESAURITO</span>}
                  {dish.active === false && <span style={{ fontSize: '0.7rem', background: 'var(--admin-bg)', color: 'var(--admin-text-muted)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>NASCOSTO</span>}
                  {dish.recommended && <Star size={14} fill="#eab308" color="#eab308" title="Consigliato" />}
                </div>
                
                <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dish.desc || 'Nessuna descrizione.'} {dish.allergens && <span style={{ fontStyle: 'italic' }}>— Allergeni: {dish.allergens}</span>}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <ActionButton size="sm" variant="outline" onClick={() => toggleActive(dish)} title={dish.active ? 'Nascondi dal menù pubblico' : 'Rendi nuovamente visibile'}>
                  {dish.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </ActionButton>
                <ActionButton size="sm" variant="outline" onClick={() => toggleSoldOut(dish)} title={dish.soldOut ? 'Segna come disponibile' : 'Segna come esaurito'}>
                  <Ban size={16} color={dish.soldOut ? 'var(--admin-warning)' : 'currentColor'} />
                </ActionButton>
                <ActionButton size="sm" variant="outline" onClick={() => handleEdit(dish)} title="Modifica Piatto">
                  <Edit2 size={16} />
                </ActionButton>
                <ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ isOpen: true, id: dish.id })} title="Elimina Definitivamente" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAZIONE / MODIFICA */}
      <Modal 
        isOpen={!!isEditing} 
        onClose={() => setIsEditing(null)} 
        title={isEditing === 'new' ? 'Aggiungi Nuovo Piatto' : 'Modifica Piatto'}
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setIsEditing(null)}>Annulla</ActionButton>
            <ActionButton onClick={handleSave} disabled={isUploading}>Salva Piatto</ActionButton>
          </>
        }
      >
        <form id="dishForm" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
              {editForm.image ? (
                <img src={editForm.image} alt="Anteprima" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon color="#94a3b8" size={32} />
              )}
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Immagine Piatto (Opzionale)</label>
              <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageUpload} style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }} disabled={isUploading} />
              {isUploading && <div style={{ fontSize: '0.85rem', color: 'var(--admin-primary)', fontWeight: 600 }}>Caricamento: {Math.round(uploadProgress)}%</div>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Nome Piatto *</label>
              <input className="admin-input" required placeholder="Es. Tortelli Verdi" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Prezzo (€)</label>
              <input type="number" step="0.5" min="0" placeholder="0.00" className="admin-input" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Categoria *</label>
            <select className="admin-input" required value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
              <option value="" disabled>Seleziona una categoria</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Descrizione / Ingredienti</label>
            <textarea className="admin-input" rows="2" placeholder="Descrivi il piatto per ingolosire i clienti..." value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}></textarea>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Allergeni</label>
            <input className="admin-input" placeholder="Es. Glutine, Lattosio, Frutta a guscio..." value={editForm.allergens} onChange={e => setEditForm({...editForm, allergens: e.target.value})} />
          </div>

          <div style={{ display: 'flex', gap: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--admin-primary)' }} checked={editForm.active} onChange={e => setEditForm({...editForm, active: e.target.checked})} />
              Attivo nel Menù
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--admin-warning)' }} checked={editForm.soldOut} onChange={e => setEditForm({...editForm, soldOut: e.target.checked})} />
              Esaurito (Non ordinabile)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#eab308' }} checked={editForm.recommended} onChange={e => setEditForm({...editForm, recommended: e.target.checked})} />
              In evidenza (Stella)
            </label>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, id: null })} 
        onConfirm={handleDelete} 
        title="Elimina Piatto" 
        message="Sei sicuro di voler eliminare definitivamente questo piatto dal sistema? Questa operazione è irreversibile." 
        confirmText="Elimina Definitivamente" 
        isDanger={true}
      />
    </div>
  );
}
