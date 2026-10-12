'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/shared/context/AuthContext';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { LanguageSelector } from '@/shared/components/LanguageSelector';
import {
  UserCheck,
  LogOut,
  ShieldAlert,
  Activity,
  Clock,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

interface DoctorTopNavProps {
  criticalCount?: number;
  pendingCount?: number;
}

export function DoctorTopNav({ criticalCount = 0, pendingCount = 0 }: DoctorTopNavProps) {
  const { user, signOut, role } = useAuth();
  const { t } = useDoctorTranslation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Department & Workstation Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center shadow-xs shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Emergency Dept</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-800 font-semibold">Triage & Resuscitation Workstation</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Dr. Bhuvana M.V., MD
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                On Duty • Trauma Bay
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Acuity Status Indicators */}
        <div className="hidden lg:flex items-center gap-3">
          {criticalCount > 0 ? (
            <Link
              href="/doctor/queue?category=CRITICAL"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors text-xs font-bold"
              title="Click to view Critical Patients"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
              <span>{criticalCount} Critical (P1) Alerts</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Queue Stable</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{pendingCount} Pending Reviews</span>
          </div>
        </div>

        {/* Right: Language Selector, Doctor Profile & Logout */}
        <div className="flex items-center gap-3">
          <LanguageSelector />

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-xs">
              BM
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-900 truncate max-w-[130px]">
                {user?.fullName || 'Dr. Bhuvana M.V.'}
              </div>
              <div className="text-[10px] font-semibold text-teal-700">
                {role || 'Attending Doctor'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 hover:border-red-200"
            title={t('logout')}
            aria-label={t('logout')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
