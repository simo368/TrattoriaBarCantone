// src/hooks/useBookings.js
import { useState, useEffect } from 'react';
import {
  collection, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { sendConfirmationEmail, notifyRestaurant } from '../utils/emailService';

export async function cancelBooking(id) {
  await updateDoc(doc(db, 'bookings', id), { status: 'cancelled', updatedAt: serverTimestamp() });
}

export async function deleteBooking(id) {
  await deleteDoc(doc(db, 'bookings', id));
}

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
      q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    }
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [dateFilter]);

  // Crea nuova prenotazione con transazione atomica per evitare race condition
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
        status:    'confirmed',
        createdAt: serverTimestamp(),
      };

      tx.set(bookingRef, booking);
      tx.set(occupancyRef, { covers: newTotal, date, time }, { merge: true });
    });

    const withId = { ...data, status: 'confirmed', createdAt: new Date().toISOString(), id: bookingRef.id };
    sendConfirmationEmail(withId).catch(console.warn);
    notifyRestaurant(withId).catch(console.warn);
    return bookingRef.id;
  };

  const updateBooking = async (id, data) =>
    updateDoc(doc(db, 'bookings', id), { ...data, updatedAt: serverTimestamp() });

  const deleteBooking = async (id) =>
    deleteDoc(doc(db, 'bookings', id));

  return { bookings, loading, createBooking, updateBooking, cancelBooking, deleteBooking };
}

// Hook per tutte le prenotazioni (uso admin)
export function useAllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('date', 'desc'), orderBy('time', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return { bookings, loading };
}
