function get(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
}
function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const bookingsStore = {
  getAll: () => get('tbc_bookings', []),
  add: (data) => {
    const all = bookingsStore.getAll();
    const booking = { ...data, id: Date.now().toString(36) + Math.random().toString(36).slice(2), status: 'confirmed', createdAt: new Date().toISOString() };
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
