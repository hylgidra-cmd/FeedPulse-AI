import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'positive' | 'neutral' | 'negative' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', size = 'sm' }) => {
  const styles = {
    critical: 'bg-rose-100 text-rose-800 border-rose-200',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    positive: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    negative: 'bg-rose-100 text-rose-800 border-rose-200',
    gray: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${styles[variant]} ${sizeClasses}`}>
      {children}
    </span>
  );
};
