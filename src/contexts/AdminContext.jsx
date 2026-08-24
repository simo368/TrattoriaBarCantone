import { createContext, useContext } from 'react';
import { useAllBookings } from '../hooks/useBookings';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { bookings, loading } = useAllBookings();
  return (
    <AdminContext.Provider value={{ bookings, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
