import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getConfirmedTemplate, getUpdatedTemplate, getCancelledTemplate } from '../utils/emailTemplates';

/**
 * MOCK Notification Service
 * In questa fase, il sistema NON invia email reali per motivi di sicurezza (es. per non esporre chiavi SMTP).
 * Queste funzioni generano il template e aggiornano il database simulando il processo che in futuro 
 * sarà eseguito da una Firebase Cloud Function sicura.
 */

const updateEmailStatus = async (bookingId, status, errorMsg = null) => {
  try {
    const payload = {
      emailStatus: status,
      emailSentAt: status === 'sent' ? new Date().toISOString() : null,
    };
    if (errorMsg) payload.emailError = errorMsg;

    await updateDoc(doc(db, 'bookings', bookingId), payload);
  } catch (err) {
    console.error(`Impossibile aggiornare emailStatus per ${bookingId}:`, err);
  }
};

export const requestBookingConfirmation = async (bookingId, bookingData, settings = null) => {
  try {
    if (!bookingData.email) {
      await updateEmailStatus(bookingId, 'none', 'Nessuna email fornita dal cliente');
      return;
    }

    // 1. Prepara i dati e il template HTML
    const html = getConfirmedTemplate(bookingData, settings);
    
    // 2. SIMULAZIONE INVIO (Mock)
    console.log(`[MOCK EMAIL] Invio Conferma a ${bookingData.email}`);
    // console.log("HTML Renderizzato:", html);

    // 3. (In futuro) Chiamata HTTP alla Cloud Function
    // await fetch('https://us-central1-tuo-progetto.cloudfunctions.net/sendEmail', { ... })

    // 4. Aggiorna lo stato come "Inviato"
    await updateEmailStatus(bookingId, 'sent');

  } catch (error) {
    console.error("[Notification Service] Errore durante l'invio della conferma:", error);
    await updateEmailStatus(bookingId, 'failed', error.message);
  }
};

export const requestBookingUpdate = async (bookingId, bookingData, settings = null) => {
  try {
    if (!bookingData.email) return;

    const html = getUpdatedTemplate(bookingData, settings);
    console.log(`[MOCK EMAIL] Invio Aggiornamento a ${bookingData.email}`);

    await updateEmailStatus(bookingId, 'sent');
  } catch (error) {
    console.error("[Notification Service] Errore durante l'invio della modifica:", error);
    await updateEmailStatus(bookingId, 'failed', error.message);
  }
};

export const requestBookingCancellation = async (bookingId, bookingData, settings = null) => {
  try {
    if (!bookingData.email) return;

    const html = getCancelledTemplate(bookingData, settings);
    console.log(`[MOCK EMAIL] Invio Cancellazione a ${bookingData.email}`);

    await updateEmailStatus(bookingId, 'sent');
  } catch (error) {
    console.error("[Notification Service] Errore durante l'invio della cancellazione:", error);
    await updateEmailStatus(bookingId, 'failed', error.message);
  }
};
