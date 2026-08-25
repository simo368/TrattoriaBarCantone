import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

const getBaseStyle = () => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #172F27; line-height: 1.6; background-color: #F6F1E7; margin: 0; padding: 40px 20px; }
  .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(23,47,39,0.08); border: 1px solid #DDD5C7; }
  .header { background-color: #172F27; color: #F6F1E7; padding: 36px 24px; text-align: center; }
  .content { padding: 40px 32px; }
  .footer { background-color: #F6F1E7; color: #6E716A; padding: 24px; text-align: center; font-size: 13px; border-top: 1px solid #DDD5C7; }
  h1 { margin: 0; font-size: 26px; font-weight: 500; letter-spacing: -0.02em; font-family: 'Georgia', serif; }
  h2 { color: #A9563B; font-size: 22px; margin-top: 0; font-family: 'Georgia', serif; font-weight: 500; margin-bottom: 24px; }
  p { margin: 0 0 16px 0; font-size: 15px; }
  .details-box { background-color: #F6F1E7; border-radius: 4px; padding: 24px; margin-top: 32px; border: 1px solid #DDD5C7; }
  .detail-row { margin-bottom: 16px; }
  .detail-row:last-child { margin-bottom: 0; }
  .label { font-weight: 600; color: #6E716A; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
  .value { display: block; font-size: 16px; color: #172F27; font-weight: 500; }
  .btn { display: inline-block; padding: 14px 28px; background-color: #A9563B; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 32px; text-align: center; border: 1px solid #8F452F; }
  .text-center { text-align: center; }
  hr { border: none; border-top: 1px solid #DDD5C7; margin: 32px 0; }
`;

const buildEmail = (title, content, settings = null) => {
  const restaurantName = settings?.site?.title || 'Trattoria Bar Cantone';
  const phone = settings?.contact?.phone || '';
  const address = settings?.contact?.address || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
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
          Questo è un messaggio automatico da <strong>${restaurantName}</strong>.<br>
          ${address ? `${address}<br>` : ''}
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

const getDetailsHtml = (booking) => `
  <div class="details-box">
    <div class="detail-row"><span class="label">Data della Prenotazione</span><span class="value" style="text-transform: capitalize;">${formatBookingDate(booking.date)}</span></div>
    <div class="detail-row"><span class="label">Orario</span><span class="value">${booking.time}</span></div>
    <div class="detail-row"><span class="label">Numero di Persone</span><span class="value">${booking.guests}</span></div>
    ${booking.notes ? `<div class="detail-row"><span class="label">Note / Allergie</span><span class="value">${booking.notes}</span></div>` : ''}
  </div>
`;

export const getConfirmedTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Confermata</h2>
    <p>Gentile <strong>${booking.name}</strong>,</p>
    <p>Siamo felici di confermarti che la tua prenotazione è stata accettata con successo. Abbiamo riservato il tuo tavolo.</p>
    
    ${getDetailsHtml(booking)}
    
    <p style="margin-top: 32px;">Ti aspettiamo con piacere!</p>
  `;
  return buildEmail("Prenotazione Confermata", content, settings);
};

export const getUpdatedTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Aggiornata</h2>
    <p>Gentile <strong>${booking.name}</strong>,</p>
    <p>Ti informiamo che i dettagli della tua prenotazione sono stati modificati e aggiornati con successo.</p>
    
    ${getDetailsHtml(booking)}
    
    <p style="margin-top: 32px;">Se non hai richiesto tu questa modifica o necessiti di assistenza, ti preghiamo di contattarci telefonicamente.</p>
  `;
  return buildEmail("Aggiornamento Prenotazione", content, settings);
};

export const getCancelledTemplate = (booking, settings) => {
  const content = `
    <h2>Prenotazione Cancellata</h2>
    <p>Gentile <strong>${booking.name}</strong>,</p>
    <p>Ti confermiamo che la tua prenotazione prevista per il <strong><span style="text-transform: capitalize;">${formatBookingDate(booking.date)}</span></strong> alle ore <strong>${booking.time}</strong> è stata <strong>cancellata</strong> correttamente.</p>
    <p>Il tavolo è stato liberato. Speriamo di poterti accogliere un'altra volta nel nostro locale!</p>
  `;
  return buildEmail("Prenotazione Cancellata", content, settings);
};

export const getPendingTemplate = (booking, settings) => {
  const content = `
    <h2>Richiesta Ricevuta</h2>
    <p>Gentile <strong>${booking.name}</strong>,</p>
    <p>Abbiamo ricevuto correttamente la tua richiesta di prenotazione. <strong>La richiesta è in attesa di conferma.</strong></p>
    
    ${getDetailsHtml(booking)}
    
    <p style="margin-top: 32px;">Il nostro staff verificherà la disponibilità e riceverai a breve un'email di conferma definitiva.</p>
    
    ${booking.cancellationUrl ? `
      <div class="text-center">
        <a class="btn" href="${booking.cancellationUrl}">Annulla Richiesta</a>
      </div>
    ` : ''}
  `;
  return buildEmail("Richiesta di Prenotazione Ricevuta", content, settings);
};
