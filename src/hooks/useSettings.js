// src/hooks/useSettings.js
// Carica/aggiorna le impostazioni globali del locale da Firestore
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_SETTINGS = {
  businessName: 'Trattoria Bar Cantone',
  phone: '059 664317',
  phoneLink: 'tel:+390596664317',
  address: { street: 'Via Fornaci, 36', city: 'Carpi', province: 'MO', zip: '41012' },
  hours: {
    lastUpdated: new Date().toISOString().split('T')[0],
    schedule: {
      Mon: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Tue: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Wed: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Thu: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Fri: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Sat: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Sun: [{ open: '12:00', close: '15:00' }],
    },
    closedDays: [],
    note: 'Per variazioni straordinarie consulta i nostri social.',
    specialNote: null,
  },
  maxCoversPerSlot: 40,
  social: {
    instagram: 'https://www.instagram.com/trattoriabarcantone/',
    facebook: 'https://www.facebook.com/trattoriacantone/',
    tripadvisor: 'https://www.tripadvisor.it/Restaurant_Review-g670816-d2664568-Reviews-Trattoria_Bar_Cantone-Carpi_Province_of_Modena_Emilia_Romagna.html',
  },
  maps: 'https://www.google.com/maps?q=Via+Fornaci+36,+41012+Carpi+MO',
  ratings: {
    google: { score: '4,3', count: '1.760+', stars: 4, platform: 'Google', lastUpdated: new Date().toISOString().split('T')[0], url: 'https://www.google.com/search?q=Trattoria+Bar+Cantone+Carpi+recensioni' },
    tripadvisor: { score: '4,0', count: '686', stars: 4, platform: 'Tripadvisor', lastUpdated: new Date().toISOString().split('T')[0], url: 'https://www.tripadvisor.it/Restaurant_Review-g670816-d2664568-Reviews-Trattoria_Bar_Cantone-Carpi_Province_of_Modena_Emilia_Romagna.html' },
  },
};

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const ref = doc(db, 'settings', 'main');
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  const updateSettings = async (data) => {
    await setDoc(doc(db, 'settings', 'main'), data, { merge: true });
  };

  return { settings, loading, updateSettings };
}
