import React from 'react';

export default function StatusBadge({ status, label, icon: Icon }) {
  let colorClass = 'admin-badge-default';
  
  if (['confirmed', 'arrived', 'active', 'success'].includes(status)) {
    colorClass = 'admin-badge-success';
  } else if (['cancelled', 'no_show', 'error', 'inactive'].includes(status)) {
    colorClass = 'admin-badge-danger';
  } else if (['pending', 'warning'].includes(status)) {
    colorClass = 'admin-badge-warning';
  } else if (['info'].includes(status)) {
    colorClass = 'admin-badge-info';
  }

  return (
    <span className={`admin-badge ${colorClass}`}>
      {Icon && <Icon size={14} />}
      {label || status}
    </span>
  );
}
