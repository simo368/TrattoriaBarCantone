import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';
import { getConfirmedTemplate, getUpdatedTemplate, getCancelledTemplate, getPendingTemplate } from '../utils/emailTemplates';

// Setup credenziali da variabili d'ambiente
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Inizializza EmailJS se le chiavi sono presenti
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Aggiorna lo stato dell'email su Firestore
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

/**
 * Funzione centralizzata per l'invio tramite EmailJS
 */
const sendEmailJS = async (bookingData, subject, htmlMessage) => {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('[EmailJS] Configurazione mancante. Email non inviata (sviluppo/mock mode).');
    return true; // Ritorniamo true in modo da non bloccare l'app se manca la config
  }

  try {
    const templateParams = {
      to_email: bookingData.email,
      to_name: bookingData.name,
      subject: subject,
      html_message: htmlMessage
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    return response.status === 200;
  } catch (error) {
    console.error('[EmailJS] Errore invio:', error);
    throw new Error(error.text || "Errore sconosciuto durante l'invio dell'email");
  }
};

export const requestBookingReceived = async (bookingId, bookingData, settings = null) => {
  try {
    if (!bookingData.email) {
      // Nessuna email fornita, non facciamo nulla e lo segnamo
      if (bookingId) await updateEmailStatus(bookingId, 'none', 'Nessuna email fornita dal cliente');
      return;
    }

    const html = getPendingTemplate(bookingData, settings);
    await sendEmailJS(bookingData, "Richiesta di prenotazione", html);
    
    if (bookingId) await updateEmailStatus(bookingId, 'sent');
  } catch (error) {
    console.error("[Notification Service] Errore durante l'invio della ricezione:", error);
    if (bookingId) await updateEmailStatus(bookingId, 'failed', error.message);
  }
};

export const requestBookingConfirmation = async (bookingId, bookingData, settings = null) => {
  try {
    if (!bookingData.email) {
      await updateEmailStatus(bookingId, 'none', 'Nessuna email fornita dal cliente');
      return;
    }

    const html = getConfirmedTemplate(bookingData, settings);
    await sendEmailJS(bookingData, "Prenotazione Confermata", html);
    
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
    await sendEmailJS(bookingData, "Aggiornamento Prenotazione", html);
    
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
    await sendEmailJS(bookingData, "Prenotazione Cancellata", html);

    await updateEmailStatus(bookingId, 'sent');
  } catch (error) {
    console.error("[Notification Service] Errore durante l'invio della cancellazione:", error);
    await updateEmailStatus(bookingId, 'failed', error.message);
  }
};
