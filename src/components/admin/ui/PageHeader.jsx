import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {children && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}
