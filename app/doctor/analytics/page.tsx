'use client';

import React, { useEffect, useState } from 'react';
import { doctorService } from '@/shared/services/doctorService';
import { AnalyticsAggregate } from '@/shared/types/doctor';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Select } from '@/shared/components/doctor/ui/Select';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { AcuityPieChart } from '@/shared/components/charts/AcuityPieChart';
import { VolumeBarChart } from '@/shared/components/charts/VolumeBarChart';
import { BarChart3, PieChart as PieIcon, ShieldCheck, Clock, Activity, CheckCircle2 } from 'lucide-react';

export default function DoctorAnalyticsPage() {
  const { t } = useDoctorTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsAggregate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');

  const fetchAnalytics = async () => {
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
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) return <LoadingState message="Loading de-identified triage analytics..." />;
  if (error || !analytics) return <ErrorState error={error || 'Failed to load analytics'} onRetry={fetchAnalytics} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('analyticsTitle')}</h2>
          <p className="text-xs text-slate-500 mt-1">{t('privacyNotice')}</p>
        </div>
        <div className="w-48">
          <Select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            options={[
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-900">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Triage Assessments</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">27</span>
            <span className="text-xs text-slate-500 font-medium">assessments</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
            <span>Avg Review Velocity</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">{analytics.review_velocity.avg_minutes}</span>
            <span className="text-xs text-slate-500 font-medium">minutes / review</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
            <span>Clinical Agreement Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {(100 - analytics.override_rate_percent).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">concordance</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
            <span>Physician Override Rate</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{analytics.override_rate_percent}%</span>
            <span className="text-xs text-slate-500 font-medium">category modified</span>
          </div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('acuityDistribution')} subtitle="De-identified distribution across 4 clinical acuity bands.">
          <AcuityPieChart data={analytics.category_distribution} />
        </Card>

        <Card title={t('volumeTrends')} subtitle="Hourly emergency intake vs critical escalation counts.">
          <VolumeBarChart data={analytics.hourly_assessment_trends} />
        </Card>
      </div>

      {/* Workflow Review Summary Table */}
      <Card title="Review Workflow Status Summary" subtitle="Aggregate count of pending vs confirmed vs overridden triage reviews.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Pending Physician Review</span>
            <span className="text-2xl font-black text-slate-900">{analytics.review_velocity.pending_count}</span>
          </div>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-center">
            <span className="text-xs font-semibold text-emerald-800 block mb-1">Confirmed Assessments</span>
            <span className="text-2xl font-black text-emerald-700">{analytics.review_velocity.completed_count}</span>
          </div>
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-center">
            <span className="text-xs font-semibold text-purple-800 block mb-1">Overridden Assessments</span>
            <span className="text-2xl font-black text-purple-700">2</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
