# Prompt per Codex — V2 sito e gestionale per trattoria

Sei un senior product engineer, UX designer e security-minded Firebase architect. Devi progettare e sviluppare da zero un prodotto web professionale per una trattoria italiana indipendente: sito pubblico ad alta conversione + pannello gestionale operativo per sala e titolare.

Non fare una semplice vetrina. Il risultato deve essere un prodotto affidabile, riutilizzabile per più trattorie e semplice da usare durante il servizio, anche da smartphone.

## Contesto e obiettivo

Il prodotto è destinato a trattorie, osterie e agriturismi con 40–120 coperti. Il titolare non è tecnico: deve aggiornare menu, foto, orari e disponibilità senza chiamare uno sviluppatore. Il personale deve poter gestire prenotazioni in pochi secondi, con sala piena e senza formazione complessa.

La promessa commerciale del prodotto è: **“Più prenotazioni dirette, meno telefonate, nessuna commissione per tavolo e una sala sotto controllo.”**

Costruisci una V2 nuova. Puoi usare l’attuale progetto esclusivamente come riferimento funzionale e visivo; non riutilizzare logiche fragili o regole di sicurezza esistenti senza una revisione completa.

## Tecnologia richiesta

- React + Vite + JavaScript moderno; TypeScript è preferibile se non rallenta la consegna.
- Firebase: Authentication, Firestore, Storage, Cloud Functions v2 e Hosting.
- Tutte le operazioni che modificano prenotazioni, capienza, ruoli o inviano notifiche devono passare da Cloud Functions: non fidarti mai del browser per regole operative o autorizzazioni.
- Firebase App Check attivo in produzione; protezione anti-bot/rate limit per la prenotazione pubblica.
- Email transazionali dal server tramite un provider configurato con secret (non EmailJS nel browser). Prevedi un adapter sostituibile per Resend, Brevo o SendGrid.
- Funzionamento in fuso orario `Europe/Rome`.
- Nessun segreto, token privato o credenziale nel repository, nel bundle frontend o nei log.

## Architettura obbligatoria

Separa chiaramente:

```text
apps/web                 sito pubblico e admin
functions                API sicure e job server-side
shared (opzionale)       tipi, validazioni, costanti comuni
```

Usa una struttura modulare per dominio: `bookings`, `availability`, `menu`, `gallery`, `settings`, `users`, `notifications`, `analytics`.

Documenta nel README:

- setup locale;
- emulatori Firebase;
- variabili ambiente;
- inizializzazione del primo Owner;
- deploy separato di frontend, regole, indici e Functions;
- backup/ripristino;
- checklist di produzione.

## Modello dati richiesto

Progetta e documenta un modello Firestore chiaro, validato lato server.

Entità minime:

- `settings/main`: identità locale, contatti, SEO, orari, regole prenotazione, capienza, timezone, social, servizi disponibili.
- `users/{uid}`: email, nome, ruolo, attivo, creato il, ultimo accesso.
- `bookings/{id}`: dati cliente, data, ora, coperti, stato, note, fonte, audit essenziale, token di cancellazione hashato/scaduto, notifiche inviate.
- `slotOccupancy/{date_time}`: solo contatori anonimi e dati tecnici necessari alla disponibilità.
- `serviceOccupancy/{date_lunch|date_dinner}`: contatori per servizio; non ricalcolare sempre tutto lato client.
- `menu/{id}`: categoria, nome, descrizione, prezzo, allergeni, attivo, esaurito, ordine, consigliato.
- `gallery/{id}`: URL, alt text, ordine, attivo, metadati upload.
- `auditLogs/{id}`: solo per operazioni amministrative importanti, senza dati sensibili non necessari.

Gli stati di prenotazione sono: `pending`, `confirmed`, `arrived`, `completed`, `cancelled`, `no_show`.

Qualunque passaggio che rende una prenotazione attiva/inattiva deve aggiornare atomicamente sia occupazione slot sia occupazione del servizio. Cancellazione, eliminazione, modifica data/ora/coperti e no-show non devono mai lasciare contatori errati.

## Sicurezza non negoziabile

- Nessun elenco o dettaglio di prenotazioni deve essere leggibile dal pubblico.
- Firestore Rules: accesso ai dati cliente solo a `STAFF`, `MANAGER`, `OWNER`; contenuti pubblici in sola lettura.
- Il primo account non diventa mai automaticamente Owner.
- L’Owner può creare/invitare utenti, disattivarli e assegnare ruoli; le API verificano il ruolo lato server.
- `STAFF`: prenotazioni operative, senza menu/impostazioni/utenti.
- `MANAGER`: prenotazioni, disponibilità, menu, galleria, impostazioni.
- `OWNER`: tutto, inclusi utenti e configurazione critica.
- Link di cancellazione: token casuale, memorizzato solo come hash, scadenza configurabile; la funzione deve essere idempotente.
- Validazione server-side di input, orari, data futura, anticipo minimo, giorni chiusi, blocchi, capacità per slot e capacità per servizio.
- Rate limit e App Check per prenotazioni pubbliche.
- Sanitizza testi e non renderizzare mai HTML non fidato.
- Storage: upload limitati a ruoli autorizzati, MIME validi, peso massimo, path vincolati, alt text richiesto.

## Sito pubblico

Il sito deve evocare una trattoria vera: calore, territorio, cucina, sala e persone. Non deve sembrare il template di un ristorante generico o di lusso impersonale.

Stile:

- palette crema, verde bosco, terra cotta e dettagli ottone;
- tipografia editoriale ma leggibile;
- fotografie grandi di sfoglia, mani al lavoro, sala, insegna, piatti e persone; niente stock generico;
- responsive eccellente, soprattutto mobile;
- accessibilità: contrasto, focus, tastiera, `alt`, semantica e riduzione movimento.

Pagine:

1. **Home**: promessa locale-specifica, foto autentiche, piatti firma, menu pranzo, prova sociale, orari, posizione e prenotazione.
2. **Menu**: categorie dinamiche, prezzi, allergeni, piatti esauriti, piatti consigliati e CTA prenotazione.
3. **Chi siamo**: storia vera, territorio, galleria e valori concreti.
4. **Contatti**: telefono, WhatsApp se configurato, mappa, parcheggio/dehors/gruppi/accessibilità se presenti.
5. **Prenota**: processo in massimo tre passaggi: data e servizio, orario/coperti, contatti. Mostra solo fasce realmente disponibili. Per gruppi oltre soglia, manda al contatto diretto.
6. **Cancellazione**: conferma esplicita, idempotente, sicura, chiara.

SEO:

- meta title/description editabili;
- JSON-LD `Restaurant` corretto;
- Open Graph;
- sitemap e robots;
- URL e routing compatibili con Firebase Hosting, incluse aperture dirette delle pagine.

## Pannello admin: UX operativa

Il pannello deve sembrare uno strumento di sala, non un software enterprise. Le azioni importanti devono essere immediate e con feedback visibile.

### Dashboard “Oggi”

Mostra chiaramente:

- data e stato apertura;
- pranzo e cena separati;
- coperti confermati / capacità per servizio;
- prossimi arrivi;
- richieste in attesa;
- cancellazioni e no-show;
- azioni rapide: nuova prenotazione, cerca cliente, blocca servizio, apri menu.

### Prenotazioni

- lista filtrabile per intervallo, stato, pranzo/cena, nome, telefono, email;
- ordinamento, ricerca rapida e vista mobile a card;
- nuova prenotazione manuale;
- modifica con controllo capienza server-side;
- transizioni rapide: conferma, arrivati, completata, no-show, annulla;
- dettaglio cliente con note interne, contatto cliccabile e timeline modifiche;
- esportazione CSV per periodo;
- stampa o vista “foglio servizio” per la giornata.

### Calendario e disponibilità

- calendario mensile leggibile con coperti e prenotazioni per giorno;
- dettaglio giornaliero; modifica senza uscire dal calendario;
- fasce pranzo/cena, intervallo slot, capienza slot e servizio;
- chiusure ricorrenti, giorni speciali, ferie e blocchi per servizio/orario;
- tutti i cambiamenti devono riflettersi immediatamente nel sito pubblico.

### Contenuti

- Menu: CRUD, ordine drag-and-drop accessibile, piatti esauriti, allergeni, categorie editabili.
- Galleria: upload sicuro, ritaglio/anteprima facoltativi, alt text obbligatorio, ordine e pubblicazione.
- Impostazioni: dati attività, contatti, social, SEO, orari, capienze e regole di prenotazione.

### Staff e account

- Owner può creare utenti staff/manager/owner via funzione server-side; password temporanea o invito email.
- Utenti disattivabili; l’ultimo Owner non può essere rimosso.
- Account: email, ruolo, reset password reale, ultimo accesso.

## Design system admin

- Interfaccia coerente, pulita, adatta a desktop e tablet; mobile realmente usabile.
- Griglia e spaziature costanti; niente layout con stili inline sparsi se un componente riusabile è possibile.
- Icone Lucide con label e tooltip; nessuna icona ambigua.
- Stati hover, focus, loading, empty, errore e successo per ogni azione.
- Dialog accessibili: focus trap, Escape, aria label, pulsante distruttivo distinguibile.
- Nessun bottone inattivo senza spiegazione; messaggi concreti, in italiano.

## Notifiche

- Email al cliente: richiesta ricevuta, conferma, modifica, annullamento.
- Notifica interna configurabile per nuova richiesta.
- Template email responsive, sobri e personalizzati con dati del locale.
- Tutto l’invio deve avvenire lato server; salva esito senza esporre segreti.
- Struttura pronta per promemoria il giorno precedente e integrazione WhatsApp/SMS futura.

## Qualità, test e consegna

Non dichiarare mai il lavoro “finito” solo perché compila.

Implementa e verifica:

- test unitari per disponibilità, capienza e transizioni stati;
- test emulatori per Firestore Rules e Cloud Functions;
- test dei flussi: prenotazione simultanea, limite slot, limite servizio, blocco, chiusura, modifica, annullamento, no-show, ruoli, invito staff;
- build e lint senza errori;
- test responsive delle schermate admin principali;
- nessun errore console;
- seed dati demo realistici, separati dalla produzione.

Alla fine consegna:

1. elenco file creati/modificati;
2. schema architetturale conciso;
3. istruzioni esatte per configurazione Firebase e deploy;
4. checklist di collaudo manuale;
5. elenco onesto di eventuali integrazioni ancora da configurare (dominio, provider email, App Check, Maps, foto reali).

## Modalità di lavoro

1. Ispeziona il repository e identifica ciò che può essere conservato solo come riferimento.
2. Proponi un piano tecnico in fasi, ma inizia subito dalla nuova struttura e dalle fondamenta di sicurezza.
3. Procedi per incrementi piccoli e verificabili.
4. Prima di modificare dati o infrastruttura reale, spiega chiaramente cosa verrà cambiato.
5. Non inventare chiavi, email, indirizzi, recensioni o foto reali: usa placeholder espliciti e configurabili.
6. Mantieni l’interfaccia interamente in italiano.

---

## Definizione concreta di “perfetto”

Il prodotto non è “perfetto” perché ha molte funzioni: è perfetto quando non crea dubbi, errori o lavoro aggiuntivo a chi è in sala.

Progetta ogni scelta con questi tre utenti davanti agli occhi:

1. **Titolare, ore 11:40:** vuole capire in dieci secondi quanti coperti ha a pranzo, chi deve confermare e se deve bloccare una fascia.
2. **Cameriere, ore 20:25:** deve trovare una prenotazione per cognome o telefono, segnare gli arrivati e aggiungere una nota senza navigare in schermate complesse.
3. **Cliente, ore 23:15 dal telefono:** deve scegliere un tavolo in modo rassicurante e concludere senza registrazione, senza ambiguità e senza chiamare.

Se una funzionalità non aiuta almeno uno di questi scenari, non aggiungerla. Se richiede una spiegazione lunga al personale, semplificala.

Ogni azione deve avere:

- stato iniziale comprensibile;
- feedback durante il caricamento;
- conferma finale leggibile;
- errore tradotto in linguaggio umano;
- comportamento sicuro in caso di doppio click, ricarica pagina, connessione lenta o perdita di rete;
- nessuna perdita silenziosa di dati.

## Identità: una trattoria, non un SaaS generico

Il design deve far pensare a una tavola apparecchiata, alla sfoglia, al tovagliolo di cotone, al legno vissuto, al vino della casa e alla familiarità emiliana. Deve evitare sia il cliché rustico finto sia l’estetica fredda da software.

Indicazioni visive:

- Fondo crema caldo, non bianco clinico.
- Verde bosco come colore strutturale; terra cotta come azione e calore; ottone solo come dettaglio.
- Ombre lievi, bordi naturali, texture solo se discrete e performanti.
- Titoli con serif editoriale; testi e numeri con sans-serif molto leggibile.
- Foto originali: cucina, mani, vapore, sala, insegna, esterno, tavoli; mai fotografie stock di ristoranti non reali.
- I dettagli operativi del pannello devono restare nitidi: la suggestione da trattoria non deve ridurre leggibilità, contrasto o velocità.
- Coperti, orari e stati devono essere più evidenti della decorazione.

Microcopy italiano, diretto e umano. Esempi:

- “Il servizio di pranzo è quasi completo.”
- “Hai ancora 14 coperti disponibili a cena.”
- “Il cliente ha annullato: i coperti sono tornati disponibili.”
- “Questo piatto non comparirà nel menu pubblico.”
- “Per tavolate oltre 12 persone, chiama la trattoria: così troviamo la soluzione migliore.”

Evita copy da startup come “Ottimizza la tua pipeline”, “Insights”, “Submit”, “Error 500”, “record”, “dashboard analytics”.

## Specifica dettagliata delle prenotazioni

### Regole prenotazione configurabili

Implementa dal pannello, con valori di default sensati:

- anticipo minimo in minuti/ore;
- orizzonte massimo prenotabile in giorni;
- massimo coperti in una singola prenotazione online;
- massimo coperti per slot;
- massimo coperti per servizio;
- intervallo slot (15, 20, 30 minuti);
- durata media tavolo opzionale, se si vuole evolvere verso gestione tavoli;
- richiesta obbligatoria o facoltativa di email;
- conferma automatica oppure stato iniziale `pending`;
- possibilità di prenotare nello stesso giorno;
- messaggio personalizzato per gruppi, chiusure e indisponibilità;
- blocco prenotazioni online fino a un orario definito prima del servizio.

Non usare soglie hardcoded nel frontend. Le regole devono essere lette, validate e applicate lato server.

### Disponibilità reale

La disponibilità deve essere una sola fonte di verità. Non deve mai differire fra sito, calendario e pannello.

Per ogni richiesta server-side:

1. verifica formato e normalizzazione dati;
2. verifica data valida nel fuso `Europe/Rome`;
3. rifiuta date passate e orari già trascorsi;
4. verifica anticipo minimo;
5. verifica orizzonte massimo;
6. verifica apertura ordinaria;
7. applica eccezioni, ferie e chiusure;
8. applica blocchi su intero giorno, pranzo, cena o singolo slot;
9. verifica che lo slot appartenga davvero alla griglia configurata;
10. verifica capienza slot;
11. verifica capienza servizio;
12. aggiorna tutte le occupazioni nella stessa transazione;
13. registra origine e audit dell’azione;
14. restituisce un errore specifico, senza rivelare dati altrui.

Gestisci correttamente questi casi:

- due persone prenotano l’ultimo tavolo nello stesso istante;
- un admin aggiunge manualmente coperti mentre un cliente sta completando il form;
- il cliente torna indietro nel form dopo che la fascia è divenuta piena;
- una prenotazione viene spostata fra pranzo e cena;
- una prenotazione passa da 2 a 8 coperti;
- una prenotazione viene annullata, poi aperta di nuovo con lo stesso link;
- una prenotazione viene marcata no-show;
- una chiusura straordinaria viene aggiunta quando ci sono già prenotazioni;
- cambiano capienza o orari dopo che esistono prenotazioni;
- ora legale, mezzanotte e cambio data nel fuso italiano;
- rete instabile, doppio invio o refresh durante la richiesta.

Per le chiusure applicate a date già prenotate, non cancellare automaticamente. Mostra una criticità al manager/owner con numero di prenotazioni coinvolte, elenco protetto e azione esplicita da scegliere.

### Creazione online

Il percorso deve essere mobile-first e non superare tre passaggi:

1. Data, numero persone e servizio.
2. Orario disponibile.
3. Nome, telefono, email e note facoltative.

Dettagli obbligatori:

- calendario italiano, con giorni chiusi e non selezionabili;
- selezione persone accessibile, senza dropdown interminabili;
- pulsanti orario grandi, con stati pieno/non disponibile ben distinti;
- non mostrare un orario non selezionabile come fosse cliccabile;
- riepilogo persistente di data, ora e coperti prima dell’invio;
- consenso privacy obbligatorio con link all’informativa configurabile;
- divieto di usare il modulo per gruppi oltre soglia: mostra contatto reale;
- bottone invio con protezione doppio submit;
- pagina di successo con riferimento prenotazione, cosa succederà dopo e recapiti;
- non mostrare mai al pubblico email, nomi o contatori di altri clienti.

### Prenotazione inserita a mano

Nel pannello deve essere più veloce di ricevere la telefonata:

- apribile dalla dashboard con un’azione chiara;
- focus sul nome;
- cerca cliente esistente per telefono o cognome, ma non obbliga a usare una rubrica;
- propone data/servizio/orario sensati;
- permette di forzare l’inserimento oltre il limite solo a Owner/Manager, chiedendo un motivo e salvando audit;
- segnala chiaramente eventuali conflitti; non impedisce una decisione consapevole del manager;
- può essere indicata origine `telefono`, `walk-in`, `WhatsApp`, `admin`, `sito`;
- dopo salvataggio offre “aggiungi un’altra” senza riaprire tutto il modal.

### Ciclo di vita e audit

Definisci transizioni consentite. Ad esempio:

- `pending → confirmed | cancelled`;
- `confirmed → arrived | cancelled | no_show`;
- `arrived → completed`;
- `cancelled` e `no_show` possono essere ripristinati solo da Manager/Owner con controllo capienza;
- ogni cambio stato aggiorna data, operatore e nota eventuale.

Nel dettaglio mostra una timeline sobria: “Creata dal sito”, “Confermata da Anna”, “Cliente arrivato”, con orari. Non salvare più dati personali di quelli necessari.

## Modulo “Oggi” di qualità eccellente

La dashboard iniziale deve essere la pagina più utile dell’intero prodotto.

Struttura consigliata:

- saluto e data estesa italiana;
- stato locale: aperto/chiuso, prossimo servizio, eventuale chiusura speciale;
- due card grandi: **Pranzo** e **Cena**, ciascuna con prenotazioni attive, coperti, capienza, percentuale e disponibilità residua;
- riga “Adesso”: prossimi arrivi, richieste in attesa e azioni urgenti;
- timeline degli arrivi ordinata cronologicamente;
- filtri rapidi: tutti, in attesa, confermati, arrivati, criticità;
- bottone “Nuova prenotazione” sempre visibile;
- in mobile, le azioni operative devono essere raggiungibili con una mano e senza scroll eccessivo.

La dashboard non deve fingere precisione: se i dati non sono disponibili, mostra un errore recuperabile con “Riprova”, non uno zero fuorviante.

## Calendario, lista e foglio servizio

### Calendario

- Settimana con inizio lunedì e nomi italiani.
- Nei giorni: numero prenotazioni, coperti attivi, indicatore pranzo/cena, chiusure e sovraccarichi.
- Non ridurre l’accessibilità a un calendario visivo: ogni cella deve essere navigabile da tastiera e avere aria-label utile.
- Dettaglio giornata: separa pranzo e cena, mostra coperti e capienza di ciascun servizio.
- Le prenotazioni annullate/no-show possono essere visibili, ma non devono falsare coperti attivi.
- La modifica dal calendario deve usare lo stesso form e le stesse regole della lista.

### Lista prenotazioni

- Ricerca istantanea per nome, cognome, telefono, email e note; normalizza accenti e spazi quando possibile.
- Filtri composabili ma facilmente azzerabili.
- Intervallo date con preset: Oggi, Domani, Questa settimana, Prossimi 30 giorni.
- Ordinamento esplicito; data+ora come ordinamento predefinito.
- La tabella desktop deve avere colonne allineate e azioni non nascoste; le card mobile devono avere i dati essenziali in ordine: ora, nome, coperti, stato, nota.
- I click su telefono/email devono usare `tel:` e `mailto:`.
- Esportazione CSV UTF-8 con intestazioni italiane e intervallo/filtri applicati; nessuna esportazione senza autorizzazione.

### Foglio servizio

Genera una vista stampabile pulita per una data:

- intestazione locale, data, pranzo/cena;
- ora, nome, coperti, telefono, note essenziali;
- totali e capienza;
- spazio per appunti;
- esclusione configurabile di telefono/email per minimizzare dati personali;
- stampa leggibile in bianco e nero.

## Menu, foto e contenuti: casi piccoli ma decisivi

### Menu

- Non pubblicare un piatto finché nome, categoria e prezzo non sono validi.
- Prezzi in euro formattati localmente (`12,00 €`), senza problemi floating point.
- Supporta descrizione breve, allergeni, vegetariano/vegano, piccante e senza glutine solo se il titolare li abilita.
- “Esaurito” deve rimanere visibile nel pannello ma nel pubblico essere gestibile con opzione mostra/nascondi.
- Previeni categorie duplicate e nomi vuoti.
- Drag and drop anche con tastiera o fornisci controlli sposta su/giù equivalenti.
- Mostra data ultima modifica e anteprima pubblica.

### Galleria

- Prevedi compressione/ottimizzazione immagini e varianti responsive server-side o nel workflow upload.
- Verifica dimensioni, MIME reale e peso; mostra progresso e possibilità di annullare upload.
- Non cancellare un file Storage se la rimozione Firestore non è riuscita; gestisci rollback e file orfani.
- Non pubblicare fotografie prive di alt text significativo.
- L’ordine deve restare stabile anche con upload simultanei.
- Fallback elegante se non ci sono foto.

### Impostazioni

- Salvataggio a sezioni o con indicatore modifiche non salvate.
- Avvisa prima di abbandonare impostazioni modificate.
- Valida telefono, email, URL social, CAP, provincia e link Maps.
- Orari: impedisci intervalli invertiti o sovrapposti; consenti pranzo e cena distinti.
- Cambiando una regola critica, mostra cosa influenza: “Questa modifica agirà sulle nuove prenotazioni; quelle esistenti restano invariate.”
- Prevedi “anteprima sito” in nuova scheda e non usare popup bloccabili per azioni essenziali.

## Utenti, ruoli e protezione dell’operatività

### Gestione utenti

- L’Owner può invitare o creare un utente senza disconnettere sé stesso.
- Mai inviare o loggare una password in chiaro dopo la creazione. Preferisci email invito/reset password.
- Mostra stato: invito inviato, attivo, disattivato, ultimo accesso.
- Richiedi conferma forte per disattivare utenti o cambiare un ruolo Owner.
- Impedisci di lasciare il sistema senza Owner attivo.
- La disattivazione deve revocare accesso alle API alla successiva richiesta/token refresh.
- Non rendere visibile allo staff la lista utenti.

### Privacy e GDPR

- Inserisci un’informativa privacy configurabile e consenso nel form pubblico.
- Raccogli solo nome, telefono, email facoltativa e note necessarie alla prenotazione.
- Definisci retention configurabile o job di pseudonimizzazione/cancellazione dei dati storici.
- Esportazioni limitate ai ruoli autorizzati e tracciate in audit.
- Non mettere dati di clienti in analytics, URL, console del browser, notifiche generiche o error tracking.
- Cookie banner solo se sono effettivamente presenti cookie non tecnici/analytics che lo richiedono; non simulare conformità.

## Notifiche e comunicazioni affidabili

- Invia email solo dopo una transazione riuscita; una failure email non deve annullare la prenotazione.
- Salva tentativi, esito e provider message ID senza salvare segreti.
- Implementa retry server-side controllato e idempotente; niente invii duplicati su retry della funzione.
- Il mittente, reply-to e firma devono essere configurabili dal titolare.
- Contenuto email: data italiana, ora, coperti, nome locale, telefono, indirizzo/link Maps e token di cancellazione.
- Non mettere nel link di cancellazione dati personali: solo ID opaco e token casuale; token hashato, con scadenza e invalidazione dopo uso se richiesto.
- Per email mancante, non mostrare un’icona “inviata”: mostra “Nessuna email fornita”.
- Prevedi un log chiaro e una possibilità amministrativa di reinviare una comunicazione, con conferma.

## Errori, offline e recupero

- Traduci ogni errore Firebase/HTTP in un messaggio azionabile in italiano.
- Distingui `nessuna disponibilità`, `connessione assente`, `permesso negato`, `dati non validi`, `servizio momentaneamente non disponibile`.
- Pulsante “Riprova” per errori transitori.
- Disabilita controlli durante mutazioni, ma non bloccare la lettura del resto del pannello.
- Mantieni l’ultimo stato confermato; non mostrare una prenotazione come confermata fino alla risposta server.
- Se il browser è offline, mostra banner discreto; per le azioni critiche non simulare il salvataggio.
- Error boundary per aree pubbliche/admin, con fallback coerente e dettagli tecnici solo nei log autorizzati.

## Performance e qualità tecnica

- Carica dati paginati o per intervalli: mai scaricare tutte le prenotazioni storiche nel browser.
- Usa indici Firestore documentati; non lasciare query che falliscono chiedendo un indice all’utente finale.
- Evita listener in tempo reale non necessari; chiudili sempre durante unmount.
- Immagini lazy, responsive, WebP/AVIF quando opportuno, con placeholder senza layout shift.
- Mantieni bundle ragionevole; lazy-load delle sezioni admin pesanti se utile.
- Usa date/time library coerente e testata; evita `new Date('YYYY-MM-DD')` quando può cambiare il giorno per timezone.
- Mantieni componenti piccoli, tipi/contratti espliciti e nessun duplicato della logica capienza.
- Nessun `console.log` o credenziale in produzione.
- Configura error reporting solo se privacy e consenso lo permettono.

## Test: matrice obbligatoria

Prima di dichiarare il progetto pronto, esegui e documenta test reali o emulatori per ogni riga sotto. Se uno non è eseguibile, dichiara esattamente il motivo e non scrivere “tutto funzionante”.

| Area | Casi minimi |
| --- | --- |
| Prenotazione pubblica | valida, slot pieno, servizio pieno, chiuso, blocco, data passata, anticipo minimo, gruppo oltre soglia, doppio click, due invii simultanei |
| Cancellazione | token valido, token errato, token scaduto, doppia cancellazione, liberazione coperti slot/servizio |
| Admin | crea, modifica data/ora/coperti, annulla, no-show, ripristina, elimina, conflitto di capienza |
| Ruoli | Staff, Manager, Owner, utente disattivato, ultimo Owner, tentativo API senza ruolo |
| Contenuti | crea/modifica/riordina/nascondi menu e galleria, upload non valido, rollback errore |
| UI | desktop, tablet, mobile stretto, tastiera, focus, modal Escape, screen reader label |
| Notifiche | invio, retry, errore provider, email assente, link cancellazione |
| Sicurezza | Rules emulator, callable senza App Check se richiesto, input malevolo, tentativi di lettura prenotazioni pubbliche |
| Deploy | build, lint, test, indici, funzioni, rules, routing hosting e pagine aperte direttamente |

## Criteri di accettazione finali

Non concludere prima che siano veri tutti questi punti:

- Il sito pubblico non espone mai i dati di un altro cliente.
- Nessun browser può aggirare capienza, ruoli o transizioni critiche chiamando Firestore direttamente.
- Le disponibilità di sito, admin, calendario e database coincidono dopo create/modifica/cancellazione/no-show.
- Un utente Staff non può vedere o cambiare menu, galleria, impostazioni o utenti, nemmeno alterando l’URL.
- Un account Firebase nuovo non riceve privilegi automatici.
- Tutti i pulsanti visibili svolgono davvero l’azione descritta oppure non vengono mostrati.
- Tutte le pagine admin sono gradevoli e usabili su 360 px, tablet e desktop.
- Le azioni distruttive chiedono conferma e spiegano conseguenze.
- Email non configurata o fallita non viene mostrata come inviata.
- Il progetto si builda, passa lint e test previsti.
- README permette a un altro sviluppatore di avviare emulatori e deploy senza intuizioni nascoste.
- Il prodotto mantiene il carattere di una trattoria italiana vera, con dati e foto configurabili, senza imitare un brand inesistente.

## Ordine rigoroso di implementazione

1. Audit del repository e documento decisioni V2.
2. Nuova struttura, ambiente, configurazione e tipi/validazioni condivise.
3. Firebase emulator, Firestore Rules, schema, indici e seed demo.
4. Cloud Functions per disponibilità, prenotazione, cancellazione, ruoli/inviti e notifiche; relativi test.
5. Admin: login, autorizzazione, dashboard Oggi, prenotazioni e disponibilità.
6. Admin: calendario, menu, galleria, impostazioni, utenti, esportazione e foglio servizio.
7. Sito pubblico: identità, pagine, menu e prenotazione.
8. SEO, accessibilità, responsive, error states e prestazioni.
9. Test completi, correzioni, build e guida deploy.

Alla fine, non limitarti a descrivere il risultato: esegui i comandi di verifica disponibili, riporta output sintetico e separa chiaramente ciò che è completato da ciò che richiede configurazione esterna del proprietario.
