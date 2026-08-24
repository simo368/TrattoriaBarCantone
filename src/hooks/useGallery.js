// src/hooks/useGallery.js
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export function useGallery() {
  const [photos, setPhotos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setPhotos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const uploadPhoto = async (file, label) => {
    setUploading(true);
    try {
      const path = `gallery/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url  = await getDownloadURL(sRef);
      await addDoc(collection(db, 'gallery'), {
        src: url, storagePath: path,
        alt: label || file.name,
        label: label || '',
        createdAt: serverTimestamp(),
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photo) => {
    await deleteDoc(doc(db, 'gallery', photo.id));
    if (photo.storagePath) {
      await deleteObject(storageRef(storage, photo.storagePath)).catch(() => {});
    }
  };

  return { photos, loading, uploading, uploadPhoto, deletePhoto };
}
