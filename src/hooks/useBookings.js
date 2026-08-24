// src/hooks/useBookings.js
import { useState, useEffect } from 'react';
import {
  collection, updateDoc, deleteDoc, doc, getDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { requestBookingConfirmation, requestBookingCancellation } from '../services/notificationService';
import { getSettingsOnce } from './useSettings';

// ---------------------------------------------------------
// CONSTANTS & UTILS
// ---------------------------------------------------------
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ARRIVED: 'arrived',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// ---------------------------------------------------------
// PUBLIC ACTIONS
// ---------------------------------------------------------

export async function cancelBooking(id) {
  const bookingRef = doc(db, 'bookings', id);
  let bookingData = null;
  try {
    const snap = await getDoc(bookingRef);
    if (snap.exists()) bookingData = snap.data();
  } catch(e) {}

  await updateDoc(bookingRef, { 
    status: BOOKING_STATUS.CANCELLED, 
    updatedAt: serverTimestamp() 
  });

  if (bookingData && bookingData.email) {
    getSettingsOnce().then(settings => {
      requestBookingCancellation(id, bookingData, settings);
    }).catch(console.warn);
  }
}

// ---------------------------------------------------------
// PUBLIC HOOK (Usato da Prenota.jsx)
// ---------------------------------------------------------
// Modificato per accettare dateFilter in modo reattivo
export function useBookings(dateFilter = null) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let q;
    if (dateFilter) {
      q = query(
        collection(db, 'bookings'),
        where('date', '==', dateFilter),
        orderBy('time')
      );
    } else {
      // Seleziona solo le prenotazioni da oggi in poi per alleggerire il carico pubblico
      const today = new Date().toISOString().split('T')[0];
      q = query(
        collection(db, 'bookings'),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );
    }
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, [dateFilter]);

  const createBooking = async (data, maxCoversPerSlot = 40) => {
    const { date, time, guests } = data;
    const occupancyRef = doc(db, 'slotOccupancy', `${date}_${time}`);
    const bookingRef = doc(collection(db, 'bookings'));

    await runTransaction(db, async (tx) => {
      const occSnap = await tx.get(occupancyRef);
      const currentCovers = occSnap.exists() ? occSnap.data().covers : 0;
      const newTotal = currentCovers + Number(guests);

      if (newTotal > maxCoversPerSlot) {
        throw new Error('SLOT_FULL');
      }

      const booking = {
        ...data,
        status: BOOKING_STATUS.CONFIRMED,
        emailStatus: 'pending',
        createdAt: serverTimestamp(),
      };

      tx.set(bookingRef, booking);
      tx.set(occupancyRef, { covers: newTotal, date, time }, { merge: true });
    });

    const withId = { ...data, status: BOOKING_STATUS.CONFIRMED, createdAt: new Date().toISOString(), id: bookingRef.id };
    
    // Innesco asincrono del sistema notifiche
    getSettingsOnce().then(settings => {
      requestBookingConfirmation(bookingRef.id, withId, settings);
    }).catch(console.warn);

    return bookingRef.id;
  };

  return { bookings, loading, createBooking, cancelBooking };
}

// ---------------------------------------------------------
// ADMIN ACTIONS & HOOKS
// ---------------------------------------------------------

export async function deleteBooking(id) {
  await deleteDoc(doc(db, 'bookings', id));
}

export async function updateBookingStatus(id, newStatus) {
  await updateDoc(doc(db, 'bookings', id), {
    status: newStatus,
    updatedAt: serverTimestamp()
  });
}

export async function getBookingById(id) {
  const snap = await getDoc(doc(db, 'bookings', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Ottiene SOLO le prenotazioni per una data specifica (per la vista giornaliera/admin)
export function useBookingsForDate(date) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      orderBy('time', 'asc')
    );
    
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(err);
      setError('Errore di caricamento prenotazioni odierne.');
      setLoading(false);
    });
    
    return unsub;
  }, [date]);

  return { bookings, loading, error };
}

// Ottiene le prenotazioni future (escluso annullate/no show) per metriche
export function useUpcomingBookings(startDate) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startDate) return;
    setLoading(true);
    const q = query(
      collection(db, 'bookings'),
      where('date', '>', startDate),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );
    
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error(err);
      setError('Errore di caricamento prenotazioni future.');
      setLoading(false);
    });
    
    return unsub;
  }, [startDate]);

  return { bookings, loading, error };
}
