import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'var(--admin-primary)' }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-header">
        <span className="admin-stat-title">{title}</span>
        {Icon && <Icon size={20} style={{ color }} />}
      </div>
      <div className="admin-stat-value">{value}</div>
    </div>
  );
}
