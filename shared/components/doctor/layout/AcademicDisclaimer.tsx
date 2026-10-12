'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';

export function AcademicDisclaimer() {
  const { t } = useDoctorTranslation();

  return (
    <aside
      aria-label="Clinical Decision-Support Scope Disclaimer"
      className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 font-medium"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <p className="leading-snug">
            <span className="font-bold uppercase tracking-wider text-amber-800 mr-1.5">
              Clinical Safety Notice:
            </span>
            {t('academicDisclaimer')}
          </p>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 shrink-0">
          <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Non-Diagnostic Prototype
        </span>
      </div>
    </aside>
  );
}
