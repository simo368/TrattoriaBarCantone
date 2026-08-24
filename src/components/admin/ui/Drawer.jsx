import React, { useEffect } from 'react';

export default function Drawer({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className="admin-backdrop" onClick={onClose} />}
      <aside className={`admin-drawer ${isOpen ? 'open' : ''}`}>
        {children}
      </aside>
    </>
  );
}
