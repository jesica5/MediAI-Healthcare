import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyNotice: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
      <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-semibold text-xs">
        <Lock className="w-4 h-4 text-brand-500" />
        <span>AES-256 Protected Health Information (PHI) Privacy Notice</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        {t.welcome.privacyNote} Patient names are encrypted at rest using AES-256-GCM and unique MRN hashes are derived using SHA-256. Access is protected by server-side Role-Based Access Control (RBAC).
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>HIPAA Compliance Compliant Security Architecture</span>
      </div>
    </div>
  );
};
