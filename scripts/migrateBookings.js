// scripts/migrateBookings.js
// 
// SCRIPT DI MIGRAZIONE - DA ESEGUIRE SOLO SE NECESSARIO MANUALE (Es. node scripts/migrateBookings.js)
// Questo script assegna lo stato 'confirmed' a tutte le prenotazioni che non hanno uno status definito.
//
// ATTENZIONE: Assicurati di aver configurato le credenziali admin di Firebase SDK per Node.js
// (firebase-admin) prima di eseguirlo, in quanto questo script è inteso per girare server-side.

/*
const admin = require('firebase-admin');

// Inizializza con le tue credenziali (scarica il serviceAccountKey.json da Firebase Console)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
  console.log('Inizio migrazione dati booking...');
  const snapshot = await db.collection('bookings').get();
  
  let count = 0;
  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.status) {
      batch.update(doc.ref, { status: 'confirmed', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Migrazione completata. Aggiornati ${count} documenti.`);
  } else {
    console.log('Nessun documento aveva bisogno di migrazione.');
  }
}

migrate().catch(console.error);
*/
