import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export function useGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setImages(items);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const addImage = (data) => {
    // data deve contenere url (downloadURL)
    return addDoc(collection(db, 'gallery'), { 
      ...data, 
      active: true, 
      createdAt: serverTimestamp(), 
      order: Date.now() 
    });
  };

  const updateImage = (id, data) => {
    return updateDoc(doc(db, 'gallery', id), { ...data, updatedAt: serverTimestamp() });
  };

  const deleteImage = async (id, fileUrl) => {
    // 1. Elimina da Firestore
    await deleteDoc(doc(db, 'gallery', id));
    
    // 2. Elimina da Storage (se presente e se è un url storage.firebase)
    if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
      try {
        // Estraiamo il path del file dall'URL
        const pathRegex = /o\/(.+?)\?alt=/;
        const match = fileUrl.match(pathRegex);
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          const fileRef = ref(storage, filePath);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.error("Errore eliminazione file dallo storage:", err);
      }
    }
  };

  const reorderGallery = async (reorderedItems) => {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    reorderedItems.forEach(item => {
      const itemRef = doc(db, 'gallery', item.id);
      batch.update(itemRef, { order: item.order });
    });
    return batch.commit();
  };

  return { images, loading, addImage, updateImage, deleteImage, reorderGallery };
}
