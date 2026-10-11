import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'critical' | 'high' | 'moderate' | 'low';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    // Clinical Acuity Specific tokens
    critical: 'bg-[#E53E3E]/10 text-[#E53E3E] border-[#E53E3E]/30 font-extrabold',
    high: 'bg-[#ED8936]/10 text-[#ED8936] border-[#ED8936]/30 font-bold',
    moderate: 'bg-[#ECC94B]/10 text-[#b59318] dark:text-[#ECC94B] border-[#ECC94B]/30 font-semibold',
    low: 'bg-[#38A169]/10 text-[#38A169] border-[#38A169]/30 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
