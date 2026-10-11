'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/shared/context/LanguageContext';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { PrivacyNotice } from '@/shared/components/PrivacyNotice';
import {
  UserPlus,
  Shield,
  Activity,
  HeartPulse,
  Lock,
  Globe2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-6 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
          <span>{t.welcome.heroTitle}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          {t.app.subtitle}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t.welcome.heroDesc}
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/intake" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto shadow-lg shadow-brand-500/25"
              leftIcon={<Activity className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Begin Triage Assessment
            </Button>
          </Link>
          <Link href="/doctor/queue" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto border-brand-500/30"
              leftIcon={<HeartPulse className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            >
              Doctor Workstation
            </Button>
          </Link>
          <Link href="/signin" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              leftIcon={<Shield className="w-5 h-5 text-brand-500" />}
            >
              {t.welcome.staffLogin}
            </Button>
          </Link>
        </div>
      </div>

      {/* Capabilities Overview Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
          {t.welcome.featuresTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-brand-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.welcome.feature1Title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.welcome.feature1Desc}
              </p>
            </div>
          </Card>

          <Card className="hover:border-brand-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.welcome.feature2Title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.welcome.feature2Desc}
              </p>
            </div>
          </Card>

          <Card className="hover:border-brand-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.welcome.feature3Title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.welcome.feature3Desc}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Clinical Acuity Standard Color Tokens Note */}
      <Card className="bg-slate-900/90 text-white border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-bold tracking-wide">
              Shared Clinical Acuity Color Tokens (M1 Governance)
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Module M1 preserves team-wide acuity design tokens without independently calculating risk tiers:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 rounded-lg bg-[#E53E3E]/20 border border-[#E53E3E]/40 text-center">
              <div className="w-3 h-3 rounded-full bg-[#E53E3E] mx-auto mb-1"></div>
              <span className="text-[11px] font-bold text-red-200">Critical (#E53E3E)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#ED8936]/20 border border-[#ED8936]/40 text-center">
              <div className="w-3 h-3 rounded-full bg-[#ED8936] mx-auto mb-1"></div>
              <span className="text-[11px] font-bold text-orange-200">High (#ED8936)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#ECC94B]/20 border border-[#ECC94B]/40 text-center">
              <div className="w-3 h-3 rounded-full bg-[#ECC94B] mx-auto mb-1"></div>
              <span className="text-[11px] font-bold text-yellow-200">Moderate (#ECC94B)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#38A169]/20 border border-[#38A169]/40 text-center">
              <div className="w-3 h-3 rounded-full bg-[#38A169] mx-auto mb-1"></div>
              <span className="text-[11px] font-bold text-green-200">Low (#38A169)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy Notice */}
      <PrivacyNotice />
    </div>
  );
}
