// src/utils/availability.js
// Calcola gli slot disponibili per una data, in base agli orari di apertura e prenotazioni esistenti

import { format, parseISO, setHours, setMinutes, isAfter, isBefore, addMinutes } from 'date-fns';

/**
 * Genera tutti gli slot di 30 minuti per una giornata, in base allo schedule.
 * schedule: { Mon: [{open:'12:00', close:'15:00'}, ...], ... }
 */
export function generateSlots(date, schedule) {
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayKey   = dayNames[date.getDay()];
  const periods  = schedule?.[dayKey] ?? [];
  const slots    = [];

  for (const { open, close } of periods) {
    const [oh, om] = open.split(':').map(Number);
    const [ch, cm] = close.split(':').map(Number);

    let current = setMinutes(setHours(new Date(date), oh), om);
    const end   = setMinutes(setHours(new Date(date), ch), cm);

    // Ultimo slot: deve iniziare almeno 30 min prima della chiusura
    const lastSlot = addMinutes(end, -30);

    while (!isAfter(current, lastSlot)) {
      slots.push(format(current, 'HH:mm'));
      current = addMinutes(current, 30);
    }
  }
  return slots;
}

/**
 * Filtra gli slot in base alle prenotazioni esistenti e ai posti massimi per slot.
 * bookings: array di { date, time, guests }
 * maxCovers: numero massimo di coperti contemporanei
 */
export function getAvailableSlots(date, schedule, bookings, maxCovers = 40) {
  const allSlots = generateSlots(date, schedule);
  const dateStr  = format(date, 'yyyy-MM-dd');

  return allSlots.filter(slot => {
    const bookedCovers = bookings
      .filter(b => b.date === dateStr && b.time === slot && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.guests || 0), 0);
    return bookedCovers < maxCovers;
  });
}

/**
 * Conta i posti occupati per uno slot.
 */
export function getSlotOccupancy(date, time, bookings) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return bookings
    .filter(b => b.date === dateStr && b.time === time && b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.guests || 0), 0);
}
