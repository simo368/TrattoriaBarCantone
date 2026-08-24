import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = "Caricamento in corso..." }) {
  return (
    <div className="admin-empty-state">
      <Loader2 size={32} className="admin-empty-icon" style={{ animation: 'spin 1s linear infinite' }} />
      <div className="admin-empty-title">{message}</div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
