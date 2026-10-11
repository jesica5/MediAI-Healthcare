'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';

export function AcademicDisclaimer() {
  const { t } = useDoctorTranslation();

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between font-medium">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{t('academicDisclaimer')}</span>
      </div>
    </div>
  );
}
