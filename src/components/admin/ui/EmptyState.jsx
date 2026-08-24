import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="admin-empty-state">
      {Icon && <Icon size={48} className="admin-empty-icon" />}
      <div className="admin-empty-title">{title}</div>
      {description && <p style={{ marginBottom: action ? '24px' : '0' }}>{description}</p>}
      {action}
    </div>
  );
}
