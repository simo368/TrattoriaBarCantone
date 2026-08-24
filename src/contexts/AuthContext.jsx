// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (u) {
        setUser(u);
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else {
            // Se non esiste, assumiamo sia il primo admin e lo creiamo come OWNER
            await setDoc(doc(db, 'users', u.uid), { role: 'OWNER', email: u.email, active: true });
            setRole('OWNER');
          }
        } catch (err) {
          console.error("Errore nel recupero del ruolo:", err);
          setRole('STAFF'); // Fallback sicuro in caso di errore
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
