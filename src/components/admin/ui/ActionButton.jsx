import React from 'react';

import { Loader2 } from 'lucide-react';

export default function ActionButton({ 
  children, 
  variant = 'primary', // primary, outline, danger
  size = 'md', // sm, md
  icon: Icon,
  className = '',
  loading = false,
  disabled = false,
  ...props 
}) {
  const baseClass = 'admin-btn';
  const variantClass = `admin-btn-${variant}`;
  const sizeClass = size === 'sm' ? 'admin-btn-sm' : '';
  const loadingClass = loading ? 'opacity-50 pointer-events-none' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 18} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 18} />
      )}
      {children}
    </button>
  );
}
