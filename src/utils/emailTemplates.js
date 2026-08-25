import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const getBaseStyle = () => `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #1e293b; color: #ffffff; padding: 24px; text-align: center; }
  .content { padding: 32px 24px; }
  .footer { background-color: #f1f5f9; color: #64748b; padding: 16px; text-align: center; font-size: 12px; }
  h1 { margin: 0; font-size: 24px; font-weight: 600; }
  h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
  .detail-row { margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
  .label { font-weight: 600; color: #64748b; font-size: 14px; }
  .value { display: block; font-size: 16px; color: #0f172a; margin-top: 4px; }
  .btn { display: inline-block; padding: 12px 24px; background-color: #e11d48; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; }
`;

const buildEmail = (title, content, settings = null) => {
  const restaurantName = settings?.site?.title || 'Trattoria Cantone';
  const phone = settings?.contact?.phone || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${getBaseStyle()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${restaurantName}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          Questo è un messaggio automatico da ${restaurantName}.<br>
          ${phone ? `Per assistenza contattaci al ${phone}` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

const formatBookingDate = (dateStr) => {
  try {
    return format(parseISO(dateStr), "EEEE d MMMM yyyy", { locale: it });
  } catch (e) {
    return dateStr;
  }
};

export const getConfirmedTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Confermata</h2>
    <p>Gentile <strong>${booking.name}</strong>, la tua prenotazione è stata confermata con successo.</p>
    
    <div style="margin-top: 24px;">
      <div class="detail-row"><span class="label">Data</span><span class="value" style="text-transform: capitalize;">${formatBookingDate(booking.date)}</span></div>
      <div class="detail-row"><span class="label">Ora</span><span class="value">${booking.time}</span></div>
      <div class="detail-row"><span class="label">Persone</span><span class="value">${booking.guests}</span></div>
      ${booking.notes ? `<div class="detail-row"><span class="label">Note</span><span class="value">${booking.notes}</span></div>` : ''}
    </div>
    
    <p style="margin-top: 24px;">Ti aspettiamo!</p>
  `;
  return buildEmail("Prenotazione Confermata", content, settings);
};

export const getUpdatedTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Modificata</h2>
    <p>Gentile <strong>${booking.name}</strong>, i dettagli della tua prenotazione sono stati aggiornati.</p>
    
    <div style="margin-top: 24px;">
      <div class="detail-row"><span class="label">Nuova Data</span><span class="value" style="text-transform: capitalize;">${formatBookingDate(booking.date)}</span></div>
      <div class="detail-row"><span class="label">Nuova Ora</span><span class="value">${booking.time}</span></div>
      <div class="detail-row"><span class="label">Persone</span><span class="value">${booking.guests}</span></div>
    </div>
  `;
  return buildEmail("Prenotazione Modificata", content, settings);
};

export const getCancelledTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Cancellata</h2>
    <p>Gentile <strong>${booking.name}</strong>, ti confermiamo che la tua prenotazione per il <strong>${formatBookingDate(booking.date)}</strong> alle ore <strong>${booking.time}</strong> è stata cancellata correttamente.</p>
    <p>Speriamo di poterti accogliere un'altra volta!</p>
  `;
  return buildEmail("Prenotazione Cancellata", content, settings);
};

export const getPendingTemplate = (booking, settings) => {
  const content = `
    <h2>Richiesta Ricevuta</h2>
    <p>Gentile <strong>${booking.name}</strong>,</p>
    <p>Abbiamo ricevuto la tua richiesta di prenotazione per <strong>${booking.guests} persone</strong>, prevista per il <strong><span style="text-transform: capitalize;">${formatBookingDate(booking.date)}</span></strong> alle ore <strong>${booking.time}</strong>.</p>
    <p>La richiesta è stata presa in carico e ti risponderemo il prima possibile per confermare la disponibilità.</p>
  `;
  return buildEmail("Richiesta di Prenotazione Ricevuta", content, settings);
};
