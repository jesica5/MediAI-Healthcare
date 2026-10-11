import React from 'react';
import { AcuityCategory } from '@/shared/types/triage';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';

interface BadgeProps {
  category?: AcuityCategory;
  variant?: 'acuity' | 'status' | 'warning' | 'info';
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ category, variant = 'acuity', children, className = '' }: BadgeProps) {
  if (category && variant === 'acuity') {
    const config = ACUITY_CONFIGS[category];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeTailwind} ${className}`}
        style={{ color: config.colorHex }}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colorHex }} />
        {children || config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 ${className}`}
    >
      {children}
    </span>
  );
}
