// src/utils/emailService.js
// Invio email via EmailJS (client-side, nessun server)
import emailjs from '@emailjs/browser';

const SERVICE_ID        = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_CONFIRM  = import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM;
const TEMPLATE_ADMIN    = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN;
const PUBLIC_KEY        = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const RESTAURANT_EMAIL  = import.meta.env.VITE_RESTAURANT_EMAIL;

/**
 * Invia email di conferma al cliente.
 */
export async function sendConfirmationEmail(booking) {
  if (!SERVICE_ID || SERVICE_ID === 'inserisci_qui') return; // EmailJS non configurato
  return emailjs.send(SERVICE_ID, TEMPLATE_CONFIRM, {
    to_email:      booking.email,
    to_name:       booking.name,
    booking_date:  booking.date,
    booking_time:  booking.time,
    booking_guests: booking.guests,
    booking_id:    booking.id,
    cancel_link:   `${window.location.origin}/prenota/cancella/${booking.id}`,
  }, PUBLIC_KEY);
}

/**
 * Notifica il ristorante di una nuova prenotazione.
 */
export async function notifyRestaurant(booking) {
  if (!SERVICE_ID || SERVICE_ID === 'inserisci_qui') return;
  return emailjs.send(SERVICE_ID, TEMPLATE_ADMIN, {
    to_email:      RESTAURANT_EMAIL,
    from_name:     booking.name,
    from_phone:    booking.phone,
    booking_date:  booking.date,
    booking_time:  booking.time,
    booking_guests: booking.guests,
    booking_notes: booking.notes || '–',
  }, PUBLIC_KEY);
}
