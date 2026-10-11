'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { Activity, Shield, LogOut, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const { user, role, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-brand-700 to-cyan-600 dark:from-white dark:via-brand-400 dark:to-cyan-400">
                  {t.app.title}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800">
                  v2.0 Baseline
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.app.subtitle}
              </p>
            </div>
          </Link>

          {/* Navigation Links & Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.nav.welcome}
              </Link>
              <Link
                href="/intake"
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Triage Intake
              </Link>
              <Link
                href="/doctor/queue"
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Doctor Workstation
              </Link>
              <Link
                href="/patient/profile"
                className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.nav.profile}
              </Link>
            </nav>

            <LanguageSelector />

            {/* Auth Session Button / Badge */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <div className="text-left text-xs hidden lg:block">
                  <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.email}
                  </div>
                  <div className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                    {role}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="p-1 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded"
                  title={t.nav.signOut}
                  aria-label={t.nav.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                <span>{t.nav.signIn}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
