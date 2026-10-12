'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { doctorService } from '@/shared/services/doctorService';
import { AnalyticsAggregate } from '@/shared/types/doctor';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Select } from '@/shared/components/doctor/ui/Select';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { AcuityPieChart } from '@/shared/components/charts/AcuityPieChart';
import { VolumeBarChart } from '@/shared/components/charts/VolumeBarChart';
import {
  BarChart3,
  PieChart as PieIcon,
  ShieldCheck,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function DoctorAnalyticsPage() {
  const { t } = useDoctorTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsAggregate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getAnalyticsData();
      if (res.error) throw new Error(res.error.message);
      setAnalytics(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve analytics aggregate statistics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, timeRange]);

  if (loading) {
    return <LoadingState message="Loading de-identified emergency triage analytics..." />;
  }
  if (error || !analytics) {
    return <ErrorState error={error || 'Failed to load analytics'} onRetry={fetchAnalytics} />;
  }

  const concordanceRate = (100 - analytics.override_rate_percent).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('analyticsTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Aggregate Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('privacyNotice')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-44">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: '24h', label: t('timeRange24h') },
                { value: '7d', label: t('timeRange7d') },
                { value: '30d', label: t('timeRange30d') },
              ]}
            />
          </div>
          <button
            type="button"
            onClick={fetchAnalytics}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200"
            title="Refresh Analytics"
            aria-label="Refresh Analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t('totalAssessments')}</span>
            <Activity className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">27</span>
            <span className="text-xs text-slate-500 font-medium">assessments</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Aggregated department intake volume</p>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
            <span>{t('reviewVelocity')}</span>
            <Clock className="w-4 h-4 text-teal-600" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">
              {analytics.review_velocity.avg_minutes}
            </span>
            <span className="text-xs text-slate-500 font-medium">min / review</span>
          </div>
          <p className="text-[10px] text-teal-800 mt-1">Average door-to-evaluation velocity</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>{t('clinicalConcordance')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{concordanceRate}%</span>
            <span className="text-xs text-slate-500 font-medium">concordance</span>
          </div>
          <p className="text-[10px] text-emerald-800 mt-1">Agreement with calculated acuity</p>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
            <span>{t('physicianOverrideRate')}</span>
            <BarChart3 className="w-4 h-4 text-purple-600" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">
              {analytics.override_rate_percent}%
            </span>
            <span className="text-xs text-slate-500 font-medium">modified</span>
          </div>
          <p className="text-[10px] text-purple-800 mt-1">Physician clinical overrides recorded</p>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={t('acuityDistribution')}
          subtitle="De-identified distribution across 4 clinical acuity bands (Critical #E53E3E, High #ED8936, Moderate #ECC94B, Low #38A169)."
        >
          <AcuityPieChart data={analytics.category_distribution} />
        </Card>

        <Card
          title={t('volumeTrends')}
          subtitle="Hourly emergency intake volume vs critical escalation trajectory."
        >
          <VolumeBarChart data={analytics.hourly_assessment_trends} />
        </Card>
      </div>

      {/* Workflow Review Summary Table */}
      <Card
        title={t('workflowStatusSummary')}
        subtitle="Aggregate count of pending vs confirmed vs overridden triage reviews."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {t('pendingPhysicianReview')}
            </span>
            <span className="text-2xl font-black text-slate-900">
              {analytics.review_velocity.pending_count}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting Attending sign-off</p>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <span className="text-xs font-semibold text-emerald-800 block mb-1">
              {t('confirmedAssessments')}
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {analytics.review_velocity.completed_count}
            </span>
            <p className="text-[10px] text-emerald-700 mt-0.5">Category concurred by doctor</p>
          </div>
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-center">
            <span className="text-xs font-semibold text-purple-800 block mb-1">
              {t('overriddenAssessments')}
            </span>
            <span className="text-2xl font-black text-purple-700">2</span>
            <p className="text-[10px] text-purple-700 mt-0.5">Justified clinical tier changes</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
