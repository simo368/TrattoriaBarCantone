// src/hooks/useBookings.js
import { useState, useEffect } from 'react';
import {
  collection, updateDoc, doc, getDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { requestBookingConfirmation, requestBookingCancellation, requestBookingReceived } from '../services/notificationService';
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

export async function cancelBooking(id, cancellationToken) {
  const cancel = httpsCallable(functions, 'cancelPublicBooking');
  await cancel({ bookingId: id, cancellationToken });
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
        collection(db, 'slotOccupancy'),
        where('date', '==', dateFilter),
        orderBy('time')
      );
    } else {
      // Il sito pubblico legge solo i totali anonimi per fascia, mai i dati dei clienti.
      const today = new Date().toISOString().split('T')[0];
      q = query(
        collection(db, 'slotOccupancy'),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );
    }
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data(), guests: Number(d.data().covers || 0) })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, [dateFilter]);

  const createBooking = async (data) => {
    const create = httpsCallable(functions, 'createPublicBooking');
    const result = await create(data);
    const { bookingId, cancellationToken } = result.data;
    const cancellationUrl = `${window.location.origin}${import.meta.env.BASE_URL}prenota/cancella/${bookingId}?token=${encodeURIComponent(cancellationToken)}`;
    const withId = { ...data, status: BOOKING_STATUS.PENDING, createdAt: new Date().toISOString(), id: bookingId, cancellationUrl };
    
    // Innesco asincrono del sistema notifiche (Ricezione)
    getSettingsOnce().then(settings => {
      requestBookingReceived(bookingId, withId, settings);
    }).catch(console.warn);

    return bookingId;
  };

  return { bookings, loading, createBooking, cancelBooking };
}

// ---------------------------------------------------------
// ADMIN ACTIONS & HOOKS
// ---------------------------------------------------------

export async function deleteBooking(id) {
  const bookingRef = doc(db, 'bookings', id);
  await runTransaction(db, async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists()) return;

    const booking = bookingSnap.data();
    const isOccupying = ![BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW].includes(booking.status);
    if (isOccupying) {
      const occupancyRef = doc(db, 'slotOccupancy', `${booking.date}_${booking.time}`);
      const occupancySnap = await tx.get(occupancyRef);
      if (occupancySnap.exists()) {
        tx.update(occupancyRef, { covers: Math.max(0, Number(occupancySnap.data().covers || 0) - Number(booking.guests || 0)) });
      }
    }
    tx.delete(bookingRef);
  });
}

export async function updateBookingStatus(id, newStatus) {
  const bookingRef = doc(db, 'bookings', id);
  const settings = await getSettingsOnce();
  let bookingData = null;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(bookingRef);
    if (!snap.exists()) throw new Error('BOOKING_NOT_FOUND');

    bookingData = snap.data();
    const wasOccupying = ![BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW].includes(bookingData.status);
    const willOccupy = ![BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW].includes(newStatus);

    if (wasOccupying !== willOccupy) {
      const occupancyRef = doc(db, 'slotOccupancy', `${bookingData.date}_${bookingData.time}`);
      const occupancySnap = await tx.get(occupancyRef);
      const currentCovers = occupancySnap.exists() ? Number(occupancySnap.data().covers || 0) : 0;
      const nextCovers = willOccupy ? currentCovers + Number(bookingData.guests || 0) : Math.max(0, currentCovers - Number(bookingData.guests || 0));
      if (willOccupy && nextCovers > (settings.maxCoversPerSlot || 40)) throw new Error('SLOT_FULL');
      tx.set(occupancyRef, { covers: nextCovers, date: bookingData.date, time: bookingData.time }, { merge: true });
    }

    tx.update(bookingRef, { status: newStatus, updatedAt: serverTimestamp() });
  });

  if (bookingData && bookingData.email) {
    Promise.resolve(settings).then(settings => {
      const updatedBookingData = { ...bookingData, status: newStatus };
      if (newStatus === BOOKING_STATUS.CONFIRMED && bookingData.status !== BOOKING_STATUS.CONFIRMED) {
        requestBookingConfirmation(id, updatedBookingData, settings);
      } else if (newStatus === BOOKING_STATUS.CANCELLED && bookingData.status !== BOOKING_STATUS.CANCELLED) {
        requestBookingCancellation(id, updatedBookingData, settings);
      }
    }).catch(console.warn);
  }
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
