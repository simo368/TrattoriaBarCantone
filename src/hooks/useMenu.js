import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, orderBy, query, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSettings } from './useSettings';

export function useMenu() {
  const { settings } = useSettings();
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);

  // Categorie dinamiche
  const CATEGORIES = useMemo(() => {
    return settings?.menuCategories || ['antipasti', 'primi', 'secondi', 'contorni', 'dolci', 'vini'];
  }, [settings?.menuCategories]);

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const grouped = {};
      CATEGORIES.forEach(c => grouped[c] = []);
      
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });

      setMenu(snap.empty ? {} : grouped);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [CATEGORIES]);

  const addDish = (category, data) =>
    addDoc(collection(db, 'menu'), { ...data, category, active: true, soldOut: false, createdAt: serverTimestamp(), order: Date.now() });

  const updateDish = (id, data) =>
    updateDoc(doc(db, 'menu', id), { ...data, updatedAt: serverTimestamp() });

  const deleteDish = (id) => deleteDoc(doc(db, 'menu', id));

  const reorderMenu = async (reorderedItems) => {
    const { writeBatch } = await import('firebase/firestore');
    const batch = writeBatch(db);
    reorderedItems.forEach(item => {
      const itemRef = doc(db, 'menu', item.id);
      batch.update(itemRef, { order: item.order });
    });
    return batch.commit();
  };

  return { menu, loading, addDish, updateDish, deleteDish, reorderMenu, CATEGORIES };
}
