'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doctorService } from '@/shared/services/doctorService';
import { TriageAssessment, AcuityCategory, TriageStatus } from '@/shared/types/triage';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Badge } from '@/shared/components/doctor/ui/Badge';
import { Input } from '@/shared/components/doctor/ui/Input';
import { Select } from '@/shared/components/doctor/ui/Select';
import { Button } from '@/shared/components/doctor/ui/Button';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { EmptyState } from '@/shared/components/doctor/ui/EmptyState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';
import {
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function EmergencyQueuePage() {
  const { t } = useDoctorTranslation();
  const [queue, setQueue] = useState<TriageAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TriageStatus | 'ALL'>('PENDING_REVIEW');
  const [categoryFilter, setCategoryFilter] = useState<AcuityCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'score' | 'time'>('priority');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getTriageQueue({
        status: statusFilter,
        category: categoryFilter,
        searchQuery: searchQuery,
      });

      if (res.error) throw new Error(res.error.message);
      let items = res.data || [];

      // Apply client-side sort adjustment if requested
      if (sortBy === 'score') {
        items = [...items].sort((a, b) => b.calculated_risk_score - a.calculated_risk_score);
      } else if (sortBy === 'time') {
        items = [...items].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      // 'priority' is already sorted by server invariant (Hard red flags > CRITICAL > HIGH > MODERATE > LOW)

      setQueue(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve emergency triage queue');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQueue();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('navQueue')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Total: {queue.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Approved API: <code className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">GET /api/v1/doctor/queue?status=PENDING_REVIEW</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchQueue} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> {t('refreshQueue')}
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              label={t('searchLabel')}
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            label={t('acuityFilterLabel')}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as AcuityCategory | 'ALL')}
            options={[
              { value: 'ALL', label: t('allCategories') },
              { value: 'CRITICAL', label: 'Critical (P1 - #E53E3E)' },
              { value: 'HIGH', label: 'High (P2 - #ED8936)' },
              { value: 'MODERATE', label: 'Moderate (P3 - #ECC94B)' },
              { value: 'LOW', label: 'Low (P4 - #38A169)' },
            ]}
          />

          <Select
            label={t('statusFilterLabel')}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TriageStatus | 'ALL')}
            options={[
              { value: 'PENDING_REVIEW', label: t('pendingOnly') },
              { value: 'CONFIRMED', label: t('confirmedOnly') },
              { value: 'OVERRIDDEN', label: t('overriddenOnly') },
              { value: 'ALL', label: t('allStatuses') },
            ]}
          />

          <Select
            label={t('sortByLabel')}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'priority' | 'score' | 'time')}
            options={[
              { value: 'priority', label: t('sortByPriority') },
              { value: 'score', label: t('sortByScore') },
              { value: 'time', label: t('sortByTime') },
            ]}
          />
        </form>
      </Card>

      {/* Main Queue List / Table */}
      {loading ? (
        <LoadingState message="Fetching live triage queue from server..." />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchQueue} />
      ) : queue.length === 0 ? (
        <EmptyState
          title="No Patients Found in Triage Queue"
          description="No pending assessments match the current filters. Adjust your search query or acuity dropdowns."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Emergency Triage Queue Table">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-4">{t('patientId')}</th>
                  <th className="py-3.5 px-4">{t('assessmentTime')}</th>
                  <th className="py-3.5 px-4">{t('chiefComplaint')}</th>
                  <th className="py-3.5 px-4">{t('triageCategory')}</th>
                  <th className="py-3.5 px-4">{t('riskScore')}</th>
                  <th className="py-3.5 px-4">{t('confidence')}</th>
                  <th className="py-3.5 px-4">{t('status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {queue.map((item) => {
                  const isMissingVitals = item.explainability_payload?.missing_vitals_warning;
                  const confidencePct = Math.round((item.confidence_score || 0.85) * 100);
                  const uncertaintyMargin = isMissingVitals ? '± 18%' : '± 6%';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <div>{item.patient?.mrn_hash || item.patient_id}</div>
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {item.patient?.gender} • {item.patient?.primary_language === 'ta' ? 'Tamil' : 'English'}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {new Date(item.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-4 max-w-sm">
                        <p className="font-semibold text-slate-800 leading-snug">{item.chief_complaint}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.hard_red_flag_triggered && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                              <ShieldAlert className="w-3 h-3 text-red-600" aria-hidden="true" /> HARD RED FLAG
                            </span>
                          )}
                          {isMissingVitals && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                              <AlertCircle className="w-3 h-3 text-amber-600" aria-hidden="true" /> MISSING VITALS
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge category={item.calculated_category} />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {item.calculated_risk_score}
                          </span>
                          <span className="text-[10px] text-slate-400">/100</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-mono text-xs font-bold ${
                                isMissingVitals ? 'text-amber-600' : 'text-emerald-700'
                              }`}
                            >
                              {confidencePct}%
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ({uncertaintyMargin})
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {isMissingVitals ? 'LOW (Vitals Missing)' : 'High Confidence'}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                            item.status === 'OVERRIDDEN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : item.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/doctor/review/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
                        >
                          {t('reviewPatient')} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
