# TrattoriaBarCantone

Sito della Trattoria Bar Cantone (Carpi). Area pubblica per menu, prenotazioni e contatti; area `/admin` protetta con Firebase Authentication.

## Cancellazione prenotazione

Il link inviato via email punta a `#/prenota/cancella/:id` (HashRouter + `base` Vite `/TrattoriaBarCantone/`). Esempio:

`https://<host>/TrattoriaBarCantone/#/prenota/cancella/<bookingId>`

## Creare l'utente admin su Firebase

L'area admin non usa più una password hardcoded. Serve un utente Email/Password in Firebase Authentication.

1. Apri [Firebase Console](https://console.firebase.google.com/) e seleziona il progetto `trattoriabarcantone`.
2. Nel menu: **Build → Authentication**.
3. Se Authentication non è ancora attivo, clicca **Get started**.
4. Tab **Sign-in method** → abilita **Email/Password** → **Enable** → **Save**.
5. Tab **Users** → **Add user**.
6. Inserisci email e password dell'amministratore (scegli una password robusta, non `cantone2024`).
7. Conferma con **Add user**.

Accedi all'area riservata da `/#/admin/login` con quella email e password.

Non committare mai le credenziali nel repository. Se le hai già usate in locale, cambiale dalla Console (Users → il menu dell'utente → Reset password).

## Firestore Security Rules

File: `firestore.rules`.

- `bookings`: `create` pubblico (prenotazione dal sito); `read`/`delete` solo admin; `update` admin, oppure pubblico **solo** per impostare `status` a `cancelled` (link email).
- `menu`, `gallery`, `settings/{docId}` (incluso `settings/main`): `read` pubblico; write solo admin.
- Sul `create` di `bookings` sono obbligatori `name`, `phone`, `date`, `time`, `guests`; `guests` deve essere un intero tra 1 e 30.

### Deploy

Da PowerShell, nella root del progetto:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

`login` apre il browser (account Google del progetto). Il deploy usa `.firebaserc` (`trattoriabarcantone`) e `firebase.json`.

In alternativa, senza CLI: Firebase Console → Firestore Database → Rules → incolla il contenuto di `firestore.rules` → Publish.
