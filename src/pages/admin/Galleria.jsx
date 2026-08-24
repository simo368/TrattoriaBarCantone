import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGallery } from '../../hooks/useGallery';
import { Plus, Edit2, Trash2, Eye, EyeOff, UploadCloud, ImageIcon } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import Modal, { ConfirmDialog } from '../../components/admin/ui/Modal';
import LoadingState from '../../components/admin/ui/LoadingState';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Galleria() {
  const { images, loading, addImage, updateImage, deleteImage, reorderGallery } = useGallery();
  
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', desc: '', active: true, url: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [orderedImages, setOrderedImages] = useState([]);
  
  // Drag & Drop refs
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const list = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
    setOrderedImages(list);
  }, [images]);

  // DRAG & DROP HANDLERS
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

    const newList = [...orderedImages];
    const dragItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, dragItemContent);
    
    const reorderedItems = newList.map((item, index) => ({ id: item.id, order: index }));
    
    dragItem.current = undefined;
    dragOverItem.current = undefined;
    setOrderedImages(newList.map((item, index) => ({ ...item, order: index })));
    
    try {
      await reorderGallery(reorderedItems);
      toast.success('Ordine aggiornato');
    } catch (err) {
      toast.error('Errore nel salvare l\'ordine');
    }
  };

  // UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      return toast.error("Formato non supportato. Usa JPG, PNG o WEBP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Il file supera i 5MB.");
    }

    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setIsUploading(true);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        setIsUploading(false);
        toast.error("Errore di caricamento.");
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setIsUploading(false);
        setUploadProgress(0);
        
        // Creiamo il documento base senza aprire il modal
        try {
          await addImage({ url: downloadURL, title: '', desc: '' });
          toast.success("Foto caricata con successo!");
        } catch (err) {
          toast.error("Errore salvataggio dati foto.");
        }
      }
    );
  };

  const handleEdit = (img) => {
    setIsEditing(img.id);
    setEditForm({ ...img });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateImage(isEditing, editForm);
      toast.success('Dati aggiornati');
      setIsEditing(null);
    } catch (err) {
      toast.error("Errore salvataggio");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await deleteImage(deleteModal.item.id, deleteModal.item.url);
      toast.success('Immagine eliminata');
      setDeleteModal({ isOpen: false, item: null });
    } catch (err) {
      toast.error("Errore eliminazione");
    }
  };

  const toggleActive = async (img) => {
    try {
      await updateImage(img.id, { active: !img.active });
      toast.success(img.active ? 'Immagine nascosta' : 'Immagine pubblicata');
    } catch {
      toast.error("Errore aggiornamento");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Galleria Immagini" subtitle="Carica, riordina (Drag&Drop) e gestisci le foto del locale.">
        <label style={{ display: 'inline-flex' }}>
          <ActionButton icon={UploadCloud} as="span" disabled={isUploading}>
            {isUploading ? `Caricamento (${Math.round(uploadProgress)}%)` : 'Carica Foto'}
          </ActionButton>
          <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
        </label>
      </PageHeader>

      {orderedImages.length === 0 && !isUploading ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--admin-border)' }}>
          <ImageIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Galleria vuota</h3>
          <p style={{ color: 'var(--admin-text-muted)' }}>Carica la tua prima foto per iniziare.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
          {orderedImages.map((img, index) => (
            <div 
              key={img.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid var(--admin-border)',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: img.active === false ? 0.6 : 1,
                transition: 'transform 0.2s',
                position: 'relative'
              }}
            >
              <img src={img.url} alt={img.title || 'Galleria'} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
              
              <div style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {img.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Senza titolo</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                  <ActionButton size="sm" variant="outline" onClick={() => toggleActive(img)} title={img.active ? 'Nascondi' : 'Pubblica'}>
                    {img.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </ActionButton>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ActionButton size="sm" variant="outline" onClick={() => handleEdit(img)}><Edit2 size={14} /></ActionButton>
                    <ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ isOpen: true, item: img })} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={!!isEditing} 
        onClose={() => setIsEditing(null)} 
        title="Dettagli Immagine"
        footer={
          <>
            <ActionButton variant="outline" onClick={() => setIsEditing(null)}>Annulla</ActionButton>
            <ActionButton onClick={handleSave}>Salva Modifiche</ActionButton>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Titolo (opzionale)</label>
            <input className="admin-input" placeholder="Es. Sala interna, Esterno..." value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Descrizione breve (opzionale)</label>
            <textarea className="admin-input" rows="2" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}></textarea>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, item: null })} 
        onConfirm={handleDelete} 
        title="Elimina Immagine" 
        message="Sei sicuro di voler eliminare questa immagine? Verrà rimossa definitivamente dallo storage." 
        confirmText="Elimina" 
        isDanger={true}
      />
    </div>
  );
}
