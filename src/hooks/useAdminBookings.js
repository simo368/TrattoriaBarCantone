import { useState, useEffect } from 'react';
import { 
  collection, doc, query, where, orderBy, onSnapshot, 
  runTransaction, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { BOOKING_STATUS } from './useBookings';
import { requestBookingConfirmation, requestBookingUpdate } from '../services/notificationService';
import { getSettingsOnce } from './useSettings';

/**
 * Carica le prenotazioni in un determinato intervallo di date.
 * Utile per non scaricare tutto il database.
 */
export function useAdminBookingsList(startDate, endDate) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'bookings'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Errore useAdminBookingsList:', err);
      setError('Impossibile caricare le prenotazioni per il periodo selezionato.');
      setLoading(false);
    });

    return unsub;
  }, [startDate, endDate]);

  return { bookings, loading, error };
}

/**
 * Crea una prenotazione lato admin. Mantiene la stessa sicurezza per l'occupazione slot.
 */
export async function adminCreateBooking(data, maxCoversPerSlot = 40) {
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
      status: data.status || BOOKING_STATUS.CONFIRMED,
      emailStatus: 'pending',
      createdAt: serverTimestamp(),
      createdByAdmin: true
    };

    tx.set(bookingRef, booking);
    tx.set(occupancyRef, { covers: newTotal, date, time }, { merge: true });
  });

  const withId = { ...data, status: data.status || BOOKING_STATUS.CONFIRMED, id: bookingRef.id };
  getSettingsOnce().then(settings => {
    requestBookingConfirmation(bookingRef.id, withId, settings);
  }).catch(console.warn);

  return bookingRef.id;
}

/**
 * Aggiorna una prenotazione lato admin.
 * Gestisce l'aggiornamento atomico degli slot se cambiano data, ora o coperti.
 */
export async function adminUpdateBooking(id, oldData, newData, maxCoversPerSlot = 40) {
  const bookingRef = doc(db, 'bookings', id);
  
  const affectsAvailability = 
    oldData.date !== newData.date || 
    oldData.time !== newData.time || 
    oldData.guests !== newData.guests;

  if (!affectsAvailability) {
    // Aggiornamento semplice senza toccare gli slot
    const updatePayload = {
      ...newData,
      updatedAt: serverTimestamp()
    };
    await runTransaction(db, async (tx) => {
        tx.update(bookingRef, updatePayload);
    });

    if (newData.email) {
      const withId = { ...newData, id: bookingRef.id };
      getSettingsOnce().then(settings => {
        requestBookingUpdate(bookingRef.id, withId, settings);
      }).catch(console.warn);
    }
    return;
  }

  // Aggiornamento complesso con ricalcolo degli slot
  const oldOccupancyRef = doc(db, 'slotOccupancy', `${oldData.date}_${oldData.time}`);
  const newOccupancyRef = doc(db, 'slotOccupancy', `${newData.date}_${newData.time}`);
  const isSameSlot = oldOccupancyRef.id === newOccupancyRef.id;

  await runTransaction(db, async (tx) => {
    const oldOccSnap = await tx.get(oldOccupancyRef);
    let oldOccCovers = oldOccSnap.exists() ? oldOccSnap.data().covers : 0;

    let newOccCovers = 0;
    if (!isSameSlot) {
      const newOccSnap = await tx.get(newOccupancyRef);
      newOccCovers = newOccSnap.exists() ? newOccSnap.data().covers : 0;
    } else {
      newOccCovers = oldOccCovers;
    }

    let finalOldCovers = oldOccCovers;
    let finalNewCovers = newOccCovers;

    if (isSameSlot) {
      const delta = Number(newData.guests) - Number(oldData.guests);
      finalNewCovers = oldOccCovers + delta;
      
      if (finalNewCovers > maxCoversPerSlot) {
        throw new Error('SLOT_FULL');
      }
    } else {
      finalOldCovers = Math.max(0, oldOccCovers - Number(oldData.guests));
      finalNewCovers = newOccCovers + Number(newData.guests);

      if (finalNewCovers > maxCoversPerSlot) {
        throw new Error('SLOT_FULL');
      }
    }

    if (isSameSlot) {
      tx.set(oldOccupancyRef, { covers: finalNewCovers, date: oldData.date, time: oldData.time }, { merge: true });
    } else {
      tx.set(oldOccupancyRef, { covers: finalOldCovers, date: oldData.date, time: oldData.time }, { merge: true });
      tx.set(newOccupancyRef, { covers: finalNewCovers, date: newData.date, time: newData.time }, { merge: true });
    }

    tx.update(bookingRef, {
      ...newData,
      updatedAt: serverTimestamp()
    });
  });

  if (newData.email) {
    const withId = { ...newData, id: bookingRef.id };
    getSettingsOnce().then(settings => {
      requestBookingUpdate(bookingRef.id, withId, settings);
    }).catch(console.warn);
  }
}
