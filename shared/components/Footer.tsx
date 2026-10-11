'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
        <div className="inline-flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 max-w-3xl mx-auto">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-[11px] leading-relaxed">
            {t.welcome.disclaimer}
          </p>
        </div>
        <p className="text-slate-400 dark:text-slate-500">
          {t.common.privacyFooter}
        </p>
      </div>
    </footer>
  );
};
