export const getUserFriendlyError = (error, context = 'Generico') => {
  // Log tecnico mantenuto in console per il debug
  console.error(`[Error - ${context}]:`, error);

  // Se non c'è errore, fallback
  if (!error) return "Si è verificato un errore inatteso. Riprova.";

  // Estraiamo il codice Firebase (o lo passiamo direttamente come stringa)
  const code = error.code || error.message || String(error);

  // 1. Errori di Rete / Offline / Timeout
  if (code.includes('unavailable') || code.includes('network-request-failed') || code.includes('timeout')) {
    return "Il server non risponde. Verifica la tua connessione internet e riprova.";
  }

  // 2. Errori di Permessi (RBAC o Slot Occupancy piena)
  if (code.includes('permission-denied')) {
    if (context === 'Prenotazione') {
      return "Siamo spiacenti, ma i posti per questo orario si sono appena esauriti (oppure il limite massimo è stato superato). Ti preghiamo di scegliere un orario o una data differente.";
    }
    return "Non hai i permessi necessari per completare questa operazione.";
  }

  // 3. Errori Auth
  if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) {
    return "Credenziali non valide. Riprova.";
  }
  if (code.includes('auth/too-many-requests')) {
    return "Troppi tentativi falliti. Riprova tra qualche minuto.";
  }
  
  // 4. Errori Storage
  if (code.includes('storage/unauthorized')) {
    return "Permesso negato per caricare questo file.";
  }
  if (code.includes('storage/canceled')) {
    return "Caricamento annullato.";
  }

  // 5. Fallback generico ma rassicurante
  return "Non è stato possibile completare l'operazione. Riprova più tardi.";
};
