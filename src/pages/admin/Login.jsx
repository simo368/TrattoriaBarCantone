import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authStore } from '../../utils/localStore';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  
  if (authStore.isLogged()) {
    return <Navigate to="/admin" />;
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (authStore.login(password)) {
      window.location.href = '/admin'; // Force reload to update context
    } else {
      toast.error('Password errata');
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
            <label className="form-label">Password di accesso</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Inserisci la password"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Accedi</button>
        </form>
        <p className="text-muted text-sm center mt-4">
          Password di default: <strong>cantone2024</strong>
        </p>
      </div>
    </div>
  );
}
