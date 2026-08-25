import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="admin-stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="admin-stat-header">
        <span className="admin-stat-title">{title}</span>
        {Icon && <Icon size={20} style={{ color: 'var(--admin-primary)' }} />}
      </div>
      <div className="admin-stat-value">{value}</div>
      {trend && <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: 'auto', paddingTop: '12px' }}>{trend}</div>}
    </div>
  );
}
