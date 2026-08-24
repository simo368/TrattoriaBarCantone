// src/hooks/useMenu.js
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORIES = ['antipasti', 'primi', 'secondi', 'dolci', 'vini'];

const DEFAULT_MENU = {
  antipasti: [
    { name: 'Salumi emiliani selezionati', desc: 'Prosciutto crudo, salame, mortadella di produzione locale.', order: 0 },
    { name: 'Gnocco fritto', desc: 'Fritto leggero e dorato, servito caldo con salumi.', order: 1 },
    { name: 'Affettati misti della casa', desc: 'Selezione di salumi e formaggi del territorio.', order: 2 },
  ],
  primi: [
    { name: 'Tortelli verdi fatti a mano', desc: "Pasta verde all'uovo ripiena di ricotta e spinaci, burro e salvia.", order: 0 },
    { name: 'Tortellini in brodo', desc: 'Tortellini artigianali in brodo di carne, ricetta tradizionale.', order: 1 },
    { name: 'Tagliatelle al ragù', desc: "Sfoglia all'uovo tirata a mano, ragù lento di carne mista.", order: 2 },
    { name: 'Lasagne al forno', desc: 'Strati di sfoglia, besciamella e ragù, gratinate al forno.', order: 3 },
  ],
  secondi: [
    { name: 'Carni selezionate alla griglia', desc: 'Selezione di carni locali, grigliate al momento.', order: 0 },
    { name: 'Specialità del giorno', desc: 'Piatto in base alla disponibilità. Chiedi al personale.', order: 1 },
  ],
  dolci: [
    { name: 'Torta della casa', desc: 'Dolce fatto in casa, varia secondo stagione e disponibilità.', order: 0 },
    { name: 'Crema al mascarpone', desc: 'Crema fresca con mascarpone, servita con biscotti.', order: 1 },
    { name: 'Zuppa inglese', desc: 'Classico dolce emiliano al cucchiaio.', order: 2 },
  ],
  vini: [
    { name: 'Lambrusco della casa', desc: 'Vino rosso frizzante del territorio, sfuso.', order: 0 },
    { name: 'Vini bianchi locali', desc: 'Selezione di bianchi emiliani.', order: 1 },
    { name: 'Acqua e bevande', desc: 'Acqua naturale e frizzante, bibite.', order: 2 },
  ],
};

export function useMenu() {
  const [menu, setMenu]     = useState(DEFAULT_MENU);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const grouped = { antipasti: [], primi: [], secondi: [], dolci: [], vini: [] };
      snap.docs.forEach(d => {
        const item = { id: d.id, ...d.data() };
        if (grouped[item.category]) grouped[item.category].push(item);
      });
      // Se Firestore è vuoto usa il default
      const isEmpty = snap.empty;
      setMenu(isEmpty ? DEFAULT_MENU : grouped);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const addDish = (category, data) =>
    addDoc(collection(db, 'menu'), { ...data, category, createdAt: serverTimestamp(), order: Date.now() });

  const updateDish = (id, data) =>
    updateDoc(doc(db, 'menu', id), { ...data, updatedAt: serverTimestamp() });

  const deleteDish = (id) => deleteDoc(doc(db, 'menu', id));

  return { menu, loading, addDish, updateDish, deleteDish, CATEGORIES };
}
