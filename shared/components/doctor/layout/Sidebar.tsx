'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Pill,
  ShieldCheck,
  Stethoscope,
  Activity,
  HeartPulse,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useDoctorTranslation();

  const navItems = [
    {
      href: '/doctor',
      label: t('navOverview'),
      icon: LayoutDashboard,
      exact: true,
      description: 'Department KPIs & queue preview',
    },
    {
      href: '/doctor/queue',
      label: t('navQueue'),
      icon: Users,
      exact: false,
      description: 'Real-time triage queue & filters',
    },
    {
      href: '/doctor/analytics',
      label: t('navAnalytics'),
      icon: BarChart3,
      exact: false,
      description: 'Acuity distribution & trends',
    },
    {
      href: '/doctor/medications',
      label: t('navMedications'),
      icon: Pill,
      exact: false,
      description: 'History reconciliation (non-Rx)',
    },
  ];

  return (
    <aside
      aria-label="Doctor Emergency Workstation Navigation"
      className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-6.5rem)] p-4 flex flex-col justify-between shrink-0 border-r border-slate-800"
    >
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <HeartPulse className="w-4 h-4 animate-pulse text-teal-400" />
            <span>Emergency Console</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Attending Physician Clinical Triage & Risk Decision Support
          </p>
        </div>

        <nav className="space-y-1.5" aria-label="Workstation Links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-start gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm font-bold ring-1 ring-teal-500/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="leading-snug">{item.label}</div>
                  <div
                    className={`text-[10px] font-normal truncate mt-0.5 ${
                      isActive ? 'text-teal-100' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Clinical Security Guard</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Doctor RBAC authorization enforced on server endpoints. Tamper-evident audit logging with zero PHI leakage.
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            MediAI Master Spec v2.0 • Module M5
          </p>
          <p className="text-[9px] text-slate-600 mt-0.5">
            Academic Decision Support Prototype
          </p>
        </div>
      </div>
    </aside>
  );
}
