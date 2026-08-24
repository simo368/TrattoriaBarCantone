import { createContext, useContext } from 'react';

// Il context admin per ora è snellito, dato che le pagine faranno fetch mirati.
// Verrà riempito in futuro con eventuali impostazioni utente/admin globali.
const AdminContext = createContext({});

export function AdminProvider({ children }) {
  return (
    <AdminContext.Provider value={{}}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
