
// src/utils/localStore.js
// Database locale nel browser – funziona senza internet o Firebase.
// Quando vorrai passare online, si collega a Firebase automaticamente.

function get(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
}
function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── SETTINGS ────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  businessName: 'Trattoria Bar Cantone',
  phone: '059 664317',
  phoneLink: 'tel:+390596664317',
  address: { street: 'Via Fornaci, 36', city: 'Carpi', province: 'MO', zip: '41012' },
  maxCoversPerSlot: 40,
  maps: 'https://www.google.com/maps?q=Via+Fornaci+36,+41012+Carpi+MO',
  social: {
    instagram: 'https://www.instagram.com/trattoriabarcantone/',
    facebook: 'https://www.facebook.com/trattoriacantone/',
    tripadvisor: 'https://www.tripadvisor.it/Restaurant_Review-g670816-d2664568-Reviews-Trattoria_Bar_Cantone-Carpi_Province_of_Modena_Emilia_Romagna.html',
  },
  ratings: {
    google: { score: '4,3', count: '1.760+', stars: 4, platform: 'Google', url: 'https://www.google.com/search?q=Trattoria+Bar+Cantone+Carpi' },
    tripadvisor: { score: '4,0', count: '686', stars: 4, platform: 'Tripadvisor', url: 'https://www.tripadvisor.it/Restaurant_Review-g670816-d2664568-Reviews-Trattoria_Bar_Cantone-Carpi_Province_of_Modena_Emilia_Romagna.html' },
  },
  hours: {
    lastUpdated: new Date().toISOString().split('T')[0],
    schedule: {
      Mon: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Tue: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Wed: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Thu: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Fri: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Sat: [{ open: '12:00', close: '15:00' }, { open: '19:00', close: '23:00' }],
      Sun: [{ open: '12:00', close: '15:00' }],
    },
    closedDays: [],
    note: 'Per variazioni straordinarie consulta i nostri social.',
    specialNote: null,
  },
};

export const settingsStore = {
  get: () => ({ ...DEFAULT_SETTINGS, ...get('tbc_settings', {}) }),
  save: (data) => set('tbc_settings', { ...settingsStore.get(), ...data }),
};

// ── MENU ────────────────────────────────────────────────
const DEFAULT_MENU = [
  { id: uid(), category: 'antipasti', name: 'Salumi emiliani selezionati', desc: 'Prosciutto crudo, salame, mortadella di produzione locale.', order: 0 },
  { id: uid(), category: 'antipasti', name: 'Gnocco fritto', desc: 'Fritto leggero e dorato, servito caldo con salumi.', order: 1 },
  { id: uid(), category: 'antipasti', name: 'Affettati misti della casa', desc: 'Selezione di salumi e formaggi del territorio.', order: 2 },
  { id: uid(), category: 'primi', name: 'Tortelli verdi fatti a mano', desc: "Pasta verde all'uovo ripiena di ricotta e spinaci, burro e salvia.", order: 0 },
  { id: uid(), category: 'primi', name: 'Tortellini in brodo', desc: 'Tortellini artigianali in brodo di carne, ricetta tradizionale.', order: 1 },
  { id: uid(), category: 'primi', name: 'Tagliatelle al ragù', desc: "Sfoglia all'uovo tirata a mano, ragù lento di carne mista.", order: 2 },
  { id: uid(), category: 'primi', name: 'Lasagne al forno', desc: 'Strati di sfoglia, besciamella e ragù, gratinate al forno.', order: 3 },
  { id: uid(), category: 'secondi', name: 'Carni selezionate alla griglia', desc: 'Selezione di carni locali, grigliate al momento.', order: 0 },
  { id: uid(), category: 'secondi', name: 'Specialità del giorno', desc: 'Piatto in base alla disponibilità. Chiedi al personale.', order: 1 },
  { id: uid(), category: 'dolci', name: 'Torta della casa', desc: 'Dolce fatto in casa, varia secondo stagione.', order: 0 },
  { id: uid(), category: 'dolci', name: 'Crema al mascarpone', desc: 'Crema fresca con mascarpone, servita con biscotti.', order: 1 },
  { id: uid(), category: 'dolci', name: 'Zuppa inglese', desc: 'Classico dolce emiliano al cucchiaio.', order: 2 },
  { id: uid(), category: 'vini', name: 'Lambrusco della casa', desc: 'Vino rosso frizzante del territorio, sfuso.', order: 0 },
  { id: uid(), category: 'vini', name: 'Vini bianchi locali', desc: 'Selezione di bianchi emiliani.', order: 1 },
];

export const menuStore = {
  getAll: () => {
    const saved = get('tbc_menu', null);
    if (!saved) { set('tbc_menu', DEFAULT_MENU); return DEFAULT_MENU; }
    return saved;
  },
  add: (item) => {
    const all = menuStore.getAll();
    const newItem = { ...item, id: uid(), order: Date.now() };
    set('tbc_menu', [...all, newItem]);
    return newItem;
  },
  update: (id, data) => {
    const all = menuStore.getAll().map(i => i.id === id ? { ...i, ...data } : i);
    set('tbc_menu', all);
  },
  delete: (id) => set('tbc_menu', menuStore.getAll().filter(i => i.id !== id)),
};

// ── BOOKINGS ─────────────────────────────────────────────
export const bookingsStore = {
  getAll: () => get('tbc_bookings', []),
  add: (data) => {
    const all = bookingsStore.getAll();
    const booking = { ...data, id: uid(), status: 'confirmed', createdAt: new Date().toISOString() };
    set('tbc_bookings', [booking, ...all]);
    return booking;
  },
  update: (id, data) => {
    const all = bookingsStore.getAll().map(b => b.id === id ? { ...b, ...data } : b);
    set('tbc_bookings', all);
  },
  cancel: (id) => bookingsStore.update(id, { status: 'cancelled' }),
  delete: (id) => set('tbc_bookings', bookingsStore.getAll().filter(b => b.id !== id)),
};

// ── AUTH ─────────────────────────────────────────────────
// Password di accesso alla dashboard (cambiabile)
const ADMIN_PASSWORD = 'cantone2024';
export const authStore = {
  isLogged: () => get('tbc_admin', false),
  login: (pw) => { if (pw === ADMIN_PASSWORD) { set('tbc_admin', true); return true; } return false; },
  logout: () => set('tbc_admin', false),
};
