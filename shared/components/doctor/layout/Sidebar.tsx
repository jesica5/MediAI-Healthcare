'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { LayoutDashboard, Users, FileText, BarChart3, Pill, Settings, ShieldCheck } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useDoctorTranslation();

  const navItems = [
    { href: '/doctor', label: t('navOverview'), icon: LayoutDashboard, exact: true },
    { href: '/doctor/queue', label: t('navQueue'), icon: Users },
    { href: '/doctor/analytics', label: t('navAnalytics'), icon: BarChart3 },
    { href: '/doctor/medications', label: t('navMedications'), icon: Pill },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Emergency Clinical Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Data Mode</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Doctor RBAC authorization enforced on server routes. Immutable PHI audit journal logged.
          </p>
        </div>
        <p className="text-[10px] text-slate-500 text-center font-medium">MediAI Master Spec v2.0 • M5</p>
      </div>
    </aside>
  );
}
