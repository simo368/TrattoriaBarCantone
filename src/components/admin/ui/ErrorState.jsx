import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ActionButton from './ActionButton';

export default function ErrorState({ message = "Si è verificato un errore.", onRetry }) {
  return (
    <div className="admin-empty-state">
      <AlertTriangle size={48} className="admin-empty-icon" style={{ color: 'var(--admin-danger)' }} />
      <div className="admin-empty-title">Ops!</div>
      <p style={{ marginBottom: onRetry ? '24px' : '0' }}>{message}</p>
      {onRetry && <ActionButton onClick={onRetry} variant="outline">Riprova</ActionButton>}
    </div>
  );
}
