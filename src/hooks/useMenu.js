// src/hooks/useMenu.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query, serverTimestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORIES = ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

const DEFAULT_MENU = {
  antipasti: [],
  primi: [],
  secondi: [],
  dolci: [],
  vini: [],
};

export function useMenu() {
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const grouped = { antipasti: [], primi: [], secondi: [], dolci: [], vini: [] };
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        if (grouped[item.category]) grouped[item.category].push(item);
      });

      setMenu(snap.empty ? DEFAULT_MENU : grouped);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const addDish = (category, data) =>
    addDoc(collection(db, 'menu'), { ...data, category, active: true, soldOut: false, createdAt: serverTimestamp(), order: Date.now() });

  const updateDish = (id, data) =>
    updateDoc(doc(db, 'menu', id), { ...data, updatedAt: serverTimestamp() });

  const deleteDish = (id) => deleteDoc(doc(db, 'menu', id));

  return { menu, loading, addDish, updateDish, deleteDish, CATEGORIES };
}
