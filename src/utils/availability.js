// src/utils/availability.js
// Gestione centralizzata della disponibilità per il ristorante.
import { format, setHours, setMinutes, isAfter, addMinutes, parseISO } from 'date-fns';
import { BOOKING_STATUS } from '../hooks/useBookings';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Ritorna se il locale è aperto in una specifica data, controllando le chiusure speciali.
 */
export function isOpen(date, settings) {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  
  // 1. Controllo giorni di chiusura standard (se array di date)
  if (settings?.hours?.closedDays?.includes(dateStr)) return false;
  
  // 2. Controllo giorni speciali (es. chiusure forzate)
  const specialDay = settings?.specialDays?.find(sd => sd.date === dateStr);
  if (specialDay && specialDay.closed) return false;

  // 3. Controllo giorni senza schedule
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const dayKey = dayNames[parsedDate.getDay()];
  const schedule = specialDay?.schedule || settings?.hours?.schedule?.[dayKey];
  
  if (!schedule || schedule.length === 0) return false;

  return true;
}

/**
 * Recupera i periodi di servizio per una data.
 */
export function getServicePeriods(date, settings) {
  if (!isOpen(date, settings)) return [];
  
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const dayKey = dayNames[parsedDate.getDay()];
  
  const specialDay = settings?.specialDays?.find(sd => sd.date === dateStr);
  return specialDay?.schedule || settings?.hours?.schedule?.[dayKey] || [];
}

/**
 * Genera tutti gli slot per una giornata.
 */
export function generateSlots(date, settings) {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const periods = getServicePeriods(parsedDate, settings);
  const slots = [];
  const interval = settings?.slotInterval || 30; // default 30 min

  for (const { open, close } of periods) {
    if (!open || !close) continue;
    const [oh, om] = open.split(':').map(Number);
    const [ch, cm] = close.split(':').map(Number);

    let current = setMinutes(setHours(new Date(parsedDate), oh), om);
    const end = setMinutes(setHours(new Date(parsedDate), ch), cm);
    
    // Ultimo slot
    const lastSlot = addMinutes(end, -interval);

    while (!isAfter(current, lastSlot)) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, interval);
    }
  }
  return slots;
}

/**
 * Controlla se uno slot specifico è prenotabile.
 */
export function isBookable(date, time, guests, settings, bookings) {
  if (!isOpen(date, settings)) return false;
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');

  // Controllo blocchi manuali
  const blocks = settings?.blocks || [];
  const isBlocked = blocks.some(b => {
    if (b.date !== dateStr) return false;
    if (b.time === 'all') return true;
    if (b.time === 'lunch' && parseInt(time.split(':')[0]) < 16) return true;
    if (b.time === 'dinner' && parseInt(time.split(':')[0]) >= 16) return true;
    if (b.time === time) return true;
    return false;
  });

  if (isBlocked) return false;

  const validBookings = bookings.filter(b => b.date === dateStr && b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.NO_SHOW);
  
  // Capacità per slot
  const slotBookings = validBookings.filter(b => b.time === time);
  const slotCovers = slotBookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const maxSlot = settings?.maxCoversPerSlot || 40;
  if ((slotCovers + guests) > maxSlot) return false;

  // Capacità per servizio (Pranzo/Cena)
  const isLunch = parseInt(time.split(':')[0]) < 16;
  const serviceBookings = validBookings.filter(b => {
    const h = parseInt(b.time.split(':')[0]);
    return isLunch ? h < 16 : h >= 16;
  });
  const serviceCovers = serviceBookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const maxService = settings?.maxCoversPerService || 120;
  if ((serviceCovers + guests) > maxService) return false;

  return true;
}

/**
 * Ritorna gli slot filtrati per disponibilità, utili per il frontend.
 */
export function getAvailableSlots(date, settings, bookings, guests = 1) {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isOpen(parsedDate, settings)) return [];
  
  const allSlots = generateSlots(parsedDate, settings);
  return allSlots.filter(slot => isBookable(parsedDate, slot, guests, settings, bookings));
}

/**
 * Funzione legacy per compatibilità, calcola occupazione esatta.
 */
export function getSlotOccupancy(date, time, bookings) {
  const dateStr = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  return bookings
    .filter(b => b.date === dateStr && b.time === time && b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.NO_SHOW)
    .reduce((sum, b) => sum + (b.guests || 0), 0);
}
