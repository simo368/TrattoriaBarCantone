import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useGallery } from '../../hooks/useGallery';
import { Plus, Edit2, Trash2, Eye, EyeOff, GripVertical, Image as ImageIcon, X } from 'lucide-react';
import PageHeader from '../../components/admin/ui/PageHeader';
import ActionButton from '../../components/admin/ui/ActionButton';
import Modal, { ConfirmDialog } from '../../components/admin/ui/Modal';
import LoadingState from '../../components/admin/ui/LoadingState';
import { storage } from '../../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Galleria() {
  const { images, loading, addImage, updateImage, deleteImage, reorderGallery } = useGallery();
  
  const [orderedImages, setOrderedImages] = useState([]);
  
  // Modals state
  const [uploadModal, setUploadModal] = useState({ isOpen: false, file: null, previewUrl: '', title: '', desc: '', progress: 0, isUploading: false });
  const [editModal, setEditModal] = useState({ isOpen: false, item: null, title: '', desc: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isDeleting: false });
  
  // Drag & Drop refs
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!images) return;
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
      toast.error("Errore nel salvare l'ordine");
    }
  };

  // UPLOAD FLOW
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image/jpeg|image/png|image/webp')) {
      return toast.error("Formato non supportato. Usa JPG, PNG o WEBP.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Il file supera i 5MB.");
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadModal(prev => ({ ...prev, file, previewUrl }));
  };

  const handleUploadSave = async (e) => {
    e.preventDefault();
    if (!uploadModal.file) return toast.error("Seleziona un'immagine prima di salvare.");

    setUploadModal(prev => ({ ...prev, isUploading: true }));

    const storageRef = ref(storage, `gallery/${Date.now()}_${uploadModal.file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, uploadModal.file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadModal(prev => ({ ...prev, progress }));
      }, 
      (error) => {
        setUploadModal(prev => ({ ...prev, isUploading: false }));
        toast.error("Errore di caricamento: " + (error.message || "riprova."));
        console.error("Upload error:", error);
      }, 
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addImage({ url: downloadURL, title: uploadModal.title, desc: uploadModal.desc });
          toast.success("Foto caricata e salvata con successo!");
          resetUploadModal();
        } catch (err) {
          setUploadModal(prev => ({ ...prev, isUploading: false }));
          toast.error("Errore nel salvataggio su database.");
        }
      }
    );
  };

  const resetUploadModal = () => {
    if (uploadModal.previewUrl) URL.revokeObjectURL(uploadModal.previewUrl);
    setUploadModal({ isOpen: false, file: null, previewUrl: '', title: '', desc: '', progress: 0, isUploading: false });
  };

  // EDIT FLOW
  const handleEditOpen = (img) => {
    setEditModal({ isOpen: true, item: img, title: img.title || '', desc: img.desc || '' });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await updateImage(editModal.item.id, { title: editModal.title, desc: editModal.desc });
      toast.success('Dati aggiornati correttamente');
      setEditModal({ isOpen: false, item: null, title: '', desc: '' });
    } catch (err) {
      toast.error("Errore salvataggio modifiche");
    }
  };

  // DELETE FLOW
  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    try {
      await deleteImage(deleteModal.item.id, deleteModal.item.url);
      toast.success('Immagine eliminata definitivamente');
      setDeleteModal({ isOpen: false, item: null, isDeleting: false });
    } catch (err) {
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
      toast.error("Errore durante l'eliminazione");
    }
  };

  // TOGGLE ACTIVE
  const toggleActive = async (img) => {
    try {
      await updateImage(img.id, { active: !img.active });
      toast.success(img.active ? 'Immagine nascosta dal sito' : 'Immagine pubblicata sul sito');
    } catch {
      toast.error("Errore aggiornamento stato");
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Gestione Galleria" subtitle="Carica immagini e trascinale per ordinare come appaiono sul sito.">
        <ActionButton icon={Plus} onClick={() => setUploadModal(prev => ({ ...prev, isOpen: true }))}>
          Aggiungi Foto
        </ActionButton>
      </PageHeader>

      {/* STATO VUOTO */}
      {orderedImages.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed var(--admin-border)' }}>
          <ImageIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--admin-text)' }}>Nessuna immagine presente</h3>
          <p style={{ color: 'var(--admin-text-muted)', marginBottom: '24px' }}>La galleria è vuota. Inizia caricando la tua prima foto.</p>
          <ActionButton icon={Plus} onClick={() => setUploadModal(prev => ({ ...prev, isOpen: true }))}>
            Carica Foto
          </ActionButton>
        </div>
      ) : (
        /* LISTA IMMAGINI */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orderedImages.map((img, index) => (
            <div 
              key={img.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                padding: '12px',
                gap: '16px',
                cursor: isDragging ? 'grabbing' : 'grab',
                opacity: img.active === false ? 0.5 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              <div style={{ color: '#cbd5e1', cursor: 'grab' }}>
                <GripVertical size={20} />
              </div>
              
              <div style={{ width: '80px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f1f5f9' }}>
                <img src={img.url} alt={img.title || 'Foto'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {img.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Senza titolo</span>}
                </div>
                {img.desc && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {img.desc}
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <ActionButton size="sm" variant="outline" onClick={() => toggleActive(img)} title={img.active ? 'Nascondi dal sito' : 'Pubblica sul sito'}>
                  {img.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </ActionButton>
                <ActionButton size="sm" variant="outline" onClick={() => handleEditOpen(img)} title="Modifica dati">
                  <Edit2 size={16} />
                </ActionButton>
                <ActionButton size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteModal({ isOpen: true, item: img, isDeleting: false })} title="Elimina definitivamente" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL (FORM) */}
      <Modal 
        isOpen={uploadModal.isOpen} 
        onClose={resetUploadModal} 
        title="Carica Nuova Foto"
      >
        <form onSubmit={handleUploadSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* File Picker & Preview */}
          {!uploadModal.file ? (
            <div style={{ border: '2px dashed var(--admin-border)', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <ImageIcon size={32} color="#94a3b8" />
                <span style={{ fontSize: '1rem', color: 'var(--admin-primary)', fontWeight: 500 }}>Clicca per selezionare un'immagine</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>JPG, PNG o WEBP (Max 5MB)</span>
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleFileSelect} />
              </label>
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
              <img src={uploadModal.previewUrl} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'contain', backgroundColor: '#f1f5f9' }} />
              {!uploadModal.isUploading && (
                <button 
                  type="button"
                  onClick={() => setUploadModal(prev => ({ ...prev, file: null, previewUrl: '' }))}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  title="Cambia immagine"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* Dati Form */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Titolo dell'immagine (visibile al click)</label>
            <input 
              className="admin-input" 
              placeholder="Es. Il nostro dehor estivo" 
              value={uploadModal.title} 
              onChange={e => setUploadModal(prev => ({...prev, title: e.target.value}))} 
              disabled={uploadModal.isUploading}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Descrizione aggiuntiva (opzionale)</label>
            <textarea 
              className="admin-input" 
              rows="2" 
              placeholder="Dettagli aggiuntivi sull'immagine..."
              value={uploadModal.desc} 
              onChange={e => setUploadModal(prev => ({...prev, desc: e.target.value}))}
              disabled={uploadModal.isUploading}
            />
          </div>

          {/* Progress Bar & Actions */}
          {uploadModal.isUploading && (
            <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', height: '6px' }}>
              <div style={{ width: `${uploadModal.progress}%`, backgroundColor: 'var(--admin-primary)', height: '100%', transition: 'width 0.3s' }}></div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
            <ActionButton type="button" variant="outline" onClick={resetUploadModal} disabled={uploadModal.isUploading}>
              Annulla
            </ActionButton>
            <ActionButton type="submit" disabled={!uploadModal.file || uploadModal.isUploading}>
              {uploadModal.isUploading ? `Caricamento in corso... ${Math.round(uploadModal.progress)}%` : 'Salva Immagine'}
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal 
        isOpen={editModal.isOpen} 
        onClose={() => setEditModal({ isOpen: false, item: null, title: '', desc: '' })} 
        title="Modifica Dati Immagine"
      >
        <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Titolo</label>
            <input 
              className="admin-input" 
              value={editModal.title} 
              onChange={e => setEditModal(prev => ({...prev, title: e.target.value}))} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.875rem' }}>Descrizione</label>
            <textarea 
              className="admin-input" 
              rows="3" 
              value={editModal.desc} 
              onChange={e => setEditModal(prev => ({...prev, desc: e.target.value}))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '20px' }}>
            <ActionButton type="button" variant="outline" onClick={() => setEditModal({ isOpen: false, item: null, title: '', desc: '' })}>
              Annulla
            </ActionButton>
            <ActionButton type="submit">
              Salva Modifiche
            </ActionButton>
          </div>
        </form>
      </Modal>

      {/* DELETE DIALOG */}
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => !deleteModal.isDeleting && setDeleteModal({ isOpen: false, item: null, isDeleting: false })} 
        onConfirm={handleDeleteConfirm} 
        title="Elimina Immagine" 
        message="Sei sicuro di voler eliminare questa immagine? Verrà rimossa dal database e dallo spazio di archiviazione (Storage). Questa azione è irreversibile." 
        confirmText={deleteModal.isDeleting ? "Eliminazione in corso..." : "Elimina Definitivamente"} 
        isDanger={true}
        disabled={deleteModal.isDeleting}
      />
    </div>
  );
}
