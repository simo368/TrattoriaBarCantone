# TrattoriaBarCantone

Sito della Trattoria Bar Cantone (Carpi). Area pubblica per menu, prenotazioni e contatti; area `/admin` protetta con Firebase Authentication.

## Cancellazione prenotazione

Il link inviato via email contiene un token monouso e punta alla pagina di cancellazione. Esempio:

`https://<host>/TrattoriaBarCantone/prenota/cancella/<bookingId>?token=<token>`

## Creare l'utente admin su Firebase

L'area admin non usa più una password hardcoded. Serve un utente Email/Password in Firebase Authentication.

1. Apri [Firebase Console](https://console.firebase.google.com/) e seleziona il progetto `trattoriabarcantone`.
2. Nel menu: **Build → Authentication**.
3. Se Authentication non è ancora attivo, clicca **Get started**.
4. Tab **Sign-in method** → abilita **Email/Password** → **Enable** → **Save**.
5. Tab **Users** → **Add user**.
6. Inserisci email e password dell'amministratore (scegli una password robusta, non `cantone2024`) e conferma con **Add user**.
7. Copia l'UID appena creato. In **Firestore Database → Data**, crea il documento `users/<UID>` con questi campi:

```json
{ "email": "admin@esempio.it", "role": "OWNER", "active": true }
```

Un utente Authentication senza questo documento non può accedere al pannello: è una protezione intenzionale. Per lo staff usa `STAFF`, per chi gestisce menu e impostazioni usa `MANAGER`.

Accedi all'area riservata da `/admin/login` con quella email e password.

Non committare mai le credenziali nel repository. Se le hai già usate in locale, cambiale dalla Console (Users → il menu dell'utente → Reset password).

## Firestore Security Rules

File: `firestore.rules`.

- `bookings`: nessun accesso diretto pubblico; prenotazioni e cancellazioni passano da Cloud Functions che validano token, capienza e frequenza delle richieste.
- `slotOccupancy`: lettura pubblica dei soli totali anonimi per fascia; permette di mostrare la disponibilità senza esporre dati personali.
- `menu`, `gallery`, `settings/{docId}` (incluso `settings/main`): `read` pubblico; write solo admin.
- Sul `create` di `bookings` sono obbligatori `name`, `phone`, `date`, `time`, `guests`; `guests` deve essere un intero tra 1 e 30.

### Deploy

Da PowerShell, nella root del progetto:

```bash
npx firebase-tools login
npm --prefix functions install
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage,functions
```

`login` apre il browser (account Google del progetto). Il deploy usa `.firebaserc` (`trattoriabarcantone`) e `firebase.json`. Le Cloud Functions richiedono il piano Firebase Blaze: sono il componente che protegge prenotazioni, cancellazioni e creazione utenti.

In alternativa, senza CLI: Firebase Console → Firestore Database → Rules → incolla il contenuto di `firestore.rules` → Publish.
