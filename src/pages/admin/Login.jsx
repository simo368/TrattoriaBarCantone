import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLogin() {
  const { user, role, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user && role) {
    return <Navigate to="/admin" />;
  }

  if (user && !role) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo"><div className="logo">Accesso <span>non autorizzato</span></div></div>
          <p className="text-muted">Questo account non ha un ruolo attivo per il pannello. Chiedi al proprietario di abilitarti.</p>
          <button type="button" className="btn btn-primary btn-full" onClick={logout}>Accedi con un altro account</button>
        </div>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      toast.error('Credenziali non valide');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo">Trattoria <span>Cantone</span></div>
          <small>Area Riservata</small>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group mb-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@esempio.it"
              autoFocus
              required
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Inserisci la password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
