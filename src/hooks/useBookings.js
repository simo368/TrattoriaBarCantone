// src/hooks/useBookings.js
import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { sendConfirmationEmail, notifyRestaurant } from '../utils/emailService';

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

  // Crea nuova prenotazione + invia email automatica
  const createBooking = async (data) => {
    const booking = {
      ...data,
      status:    'confirmed', // conferma automatica
      createdAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'bookings'), booking);
    const withId = { ...booking, id: ref.id };
    // Email asincrona (non blocca)
    sendConfirmationEmail(withId).catch(console.warn);
    notifyRestaurant(withId).catch(console.warn);
    return ref.id;
  };

  const updateBooking = async (id, data) =>
    updateDoc(doc(db, 'bookings', id), { ...data, updatedAt: serverTimestamp() });

  const cancelBooking = async (id) =>
    updateDoc(doc(db, 'bookings', id), { status: 'cancelled', updatedAt: serverTimestamp() });

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
