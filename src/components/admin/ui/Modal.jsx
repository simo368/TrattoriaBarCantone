import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import ActionButton from './ActionButton';

export default function Modal({ isOpen, onClose, title, children, footer }) {
  // Evita lo scroll del body quando il modal è aperto
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="admin-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
          <button onClick={onClose} aria-label="Chiudi finestra" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ marginBottom: '24px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// Helper rapido per un dialog di conferma
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Conferma", cancelText = "Annulla", isDanger = false }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      footer={
        <>
          <ActionButton variant="outline" onClick={onClose}>{cancelText}</ActionButton>
          <ActionButton variant={isDanger ? "danger" : "primary"} onClick={async () => { await onConfirm(); onClose(); }}>{confirmText}</ActionButton>
        </>
      }
    >
      <p style={{ color: 'var(--admin-text-muted)' }}>{message}</p>
    </Modal>
  );
}
