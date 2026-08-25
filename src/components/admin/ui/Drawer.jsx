import React, { useEffect } from 'react';

export default function Drawer({ isOpen, onClose, children }) {
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

  return (
    <>
      {isOpen && <div className="admin-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`admin-drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        {children}
      </aside>
    </>
  );
}
