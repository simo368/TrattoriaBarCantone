import { createHash, randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'arrived', 'completed']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const ROLES = new Set(['OWNER', 'MANAGER', 'STAFF']);
const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fail(code, message) { throw new HttpsError(code, message); }
function serviceFor(time) { return Number(time.slice(0, 2)) < 16 ? 'lunch' : 'dinner'; }
async function isOwner(auth) {
  if (!auth?.uid) return false;
  const user = await db.doc(`users/${auth.uid}`).get();
  return user.exists && user.data().active !== false && user.data().role === 'OWNER';
}

function validateBooking(data, settings) {
  if (!data || typeof data !== 'object') fail('invalid-argument', 'Dati prenotazione non validi.');
  const { name, phone, email = '', date, time, guests, notes = '' } = data;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) fail('invalid-argument', 'Nome non valido.');
  if (typeof phone !== 'string' || phone.trim().length < 8 || phone.length > 30) fail('invalid-argument', 'Telefono non valido.');
  if (!DATE_RE.test(date) || !TIME_RE.test(time)) fail('invalid-argument', 'Data o orario non validi.');
  if (!Number.isInteger(Number(guests)) || Number(guests) < 1 || Number(guests) > (settings.bookingRules?.maxPeoplePerBooking || 15)) fail('invalid-argument', 'Numero di persone non valido.');
  if (email && (typeof email !== 'string' || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) fail('invalid-argument', 'Email non valida.');
  if (typeof notes !== 'string' || notes.length > 500) fail('invalid-argument', 'Note troppo lunghe.');

  const parsed = new Date(`${date}T12:00:00`);
  const specialDay = settings.specialDays?.find((item) => item.date === date);
  const schedule = specialDay?.schedule || settings.hours?.schedule?.[DAY_KEYS[parsed.getDay()]] || [];
  const blocked = settings.blocks?.some((block) => block.date === date && (block.time === 'all' || block.time === time || block.time === serviceFor(time)));
  const interval = Number(settings.slotInterval || 30);
  const validTime = schedule.some(({ open, close }) => {
    const [openHour, openMinute] = open.split(':').map(Number);
    const [hour, minute] = time.split(':').map(Number);
    return time >= open && time < close && (((hour * 60 + minute) - (openHour * 60 + openMinute)) % interval === 0);
  });
  if (specialDay?.closed || settings.hours?.closedDays?.includes(date) || !validTime || blocked) fail('failed-precondition', 'Orario non disponibile.');
  return { name: name.trim(), phone: phone.trim(), email: email.trim(), date, time, guests: Number(guests), notes: notes.trim() };
}

export const createPublicBooking = onCall({ region: 'europe-west1' }, async (request) => {
  const settingsSnap = await db.doc('settings/main').get();
  const settings = settingsSnap.exists ? settingsSnap.data() : {};
  const booking = validateBooking(request.data, settings);
  const rateKey = createHash('sha256').update(request.rawRequest.ip || 'unknown').digest('hex');
  const rateRef = db.doc(`bookingRate/${rateKey}`);
  const bookingRef = db.collection('bookings').doc();
  const slotRef = db.doc(`slotOccupancy/${booking.date}_${booking.time}`);

  await db.runTransaction(async (tx) => {
    const [rateSnap, slotSnap, serviceSnap] = await Promise.all([
      tx.get(rateRef),
      tx.get(slotRef),
      tx.get(db.collection('slotOccupancy').where('date', '==', booking.date)),
    ]);
    const rate = rateSnap.exists ? rateSnap.data() : {};
    const now = Date.now();
    const isCurrentWindow = rate.windowStartedAt?.toMillis?.() > now - 10 * 60 * 1000;
    const attempts = isCurrentWindow ? Number(rate.count || 0) : 0;
    if (attempts >= 5) fail('resource-exhausted', 'Hai effettuato troppe richieste. Riprova tra qualche minuto.');

    const currentSlotCovers = Number(slotSnap.data()?.covers || 0);
    const service = serviceFor(booking.time);
    const serviceCovers = serviceSnap.docs
      .filter((doc) => serviceFor(doc.data().time) === service)
      .reduce((total, doc) => total + Number(doc.data().covers || 0), 0);
    if (currentSlotCovers + booking.guests > Number(settings.maxCoversPerSlot || 40)) fail('failed-precondition', 'Questa fascia è appena diventata completa.');
    if (serviceCovers + booking.guests > Number(settings.maxCoversPerService || 120)) fail('failed-precondition', 'Non ci sono più coperti disponibili per questo servizio.');

    const cancellationToken = randomUUID();
    tx.set(bookingRef, { ...booking, status: 'pending', emailStatus: 'pending', cancellationToken, createdAt: FieldValue.serverTimestamp() });
    tx.set(slotRef, { covers: currentSlotCovers + booking.guests, date: booking.date, time: booking.time }, { merge: true });
    tx.set(rateRef, { count: attempts + 1, windowStartedAt: isCurrentWindow ? rate.windowStartedAt : FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });

  const created = await bookingRef.get();
  return { bookingId: bookingRef.id, cancellationToken: created.data().cancellationToken };
});

export const cancelPublicBooking = onCall({ region: 'europe-west1' }, async (request) => {
  const { bookingId, cancellationToken } = request.data || {};
  if (typeof bookingId !== 'string' || typeof cancellationToken !== 'string') fail('invalid-argument', 'Link di cancellazione non valido.');
  const bookingRef = db.doc(`bookings/${bookingId}`);
  await db.runTransaction(async (tx) => {
    const bookingSnap = await tx.get(bookingRef);
    if (!bookingSnap.exists || bookingSnap.data().cancellationToken !== cancellationToken) fail('permission-denied', 'Link di cancellazione non valido.');
    const booking = bookingSnap.data();
    if (!ACTIVE_STATUSES.has(booking.status)) return;
    const slotRef = db.doc(`slotOccupancy/${booking.date}_${booking.time}`);
    const slotSnap = await tx.get(slotRef);
    tx.update(bookingRef, { status: 'cancelled', updatedAt: FieldValue.serverTimestamp() });
    tx.set(slotRef, { covers: Math.max(0, Number(slotSnap.data()?.covers || 0) - Number(booking.guests || 0)), date: booking.date, time: booking.time }, { merge: true });
  });
  return { cancelled: true };
});

export const createStaffUser = onCall({ region: 'europe-west1' }, async (request) => {
  if (!await isOwner(request.auth)) fail('permission-denied', 'Solo il proprietario può creare utenti.');
  const { email, password, role } = request.data || {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 10 || !ROLES.has(role)) fail('invalid-argument', 'Dati utente non validi.');
  const user = await getAuth().createUser({ email: email.toLowerCase().trim(), password, emailVerified: false });
  await db.doc(`users/${user.uid}`).set({ email: user.email, role, active: true, createdAt: FieldValue.serverTimestamp() });
  await getAuth().setCustomUserClaims(user.uid, { role });
  return { uid: user.uid, email: user.email };
});
