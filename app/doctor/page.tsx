'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { doctorService } from '@/shared/services/doctorService';
import { DoctorDashboardMetrics } from '@/shared/types/doctor';
import { TriageAssessment } from '@/shared/types/triage';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Badge } from '@/shared/components/doctor/ui/Badge';
import { Alert } from '@/shared/components/doctor/ui/Alert';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';
import { Clock, AlertTriangle, ShieldAlert, ArrowRight, UserCheck, Activity, CheckCircle2 } from 'lucide-react';

export default function DoctorOverviewPage() {
  const { t } = useDoctorTranslation();
  const [metrics, setMetrics] = useState<DoctorDashboardMetrics | null>(null);
  const [criticalQueue, setCriticalQueue] = useState<TriageAssessment[]>([]);
  const [recentQueue, setRecentQueue] = useState<TriageAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, queueRes] = await Promise.all([
        doctorService.getDashboardMetrics(),
        doctorService.getTriageQueue({ status: 'PENDING_REVIEW' }),
      ]);

      if (metricsRes.error) throw new Error(metricsRes.error.message);
      if (queueRes.error) throw new Error(queueRes.error.message);

      setMetrics(metricsRes.data);
      const queueData = queueRes.data || [];
      setCriticalQueue(queueData.filter(a => a.calculated_category === 'CRITICAL' || a.hard_red_flag_triggered));
      setRecentQueue(queueData.slice(0, 5));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading Doctor Emergency Workstation..." />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('doctorDashboard')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time emergency patient queue monitoring, explainable risk review & clinical sign-off console.
          </p>
        </div>
        <Link
          href="/doctor/queue"
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          View Full Emergency Queue <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>

      {/* Critical Hard Red-Flag Alert Banner if any */}
      {criticalQueue.length > 0 && (
        <Alert
          type="danger"
          title={`CRITICAL ALERT: ${criticalQueue.length} Patient(s) Requiring Immediate Physician Intervention`}
          action={
            <Link
              href={`/doctor/review/${criticalQueue[0].id}`}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm inline-flex items-center gap-1"
            >
              Review Critical Patient <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <p className="text-xs leading-relaxed">
            Immediate Bay Allocation Required (0 minute wait threshold). Patients triggered hard physiological red flags (e.g. qSOFA sepsis, severe hypoxia, crushing chest pain, or hypertensive crisis).
          </p>
        </Alert>
      )}

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('pendingReviews')}</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics?.pending_review_count || 0}</span>
            <span className="text-xs text-slate-500 font-medium">assessments</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">{t('criticalPatients')}</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-600">{metrics?.critical_count || 0}</span>
            <span className="text-xs text-red-600 font-medium">Priority 1 (P1)</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-700">{t('highPriorityPatients')}</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-orange-600">{metrics?.high_priority_count || 0}</span>
            <span className="text-xs text-orange-600 font-medium">Priority 2 (P2)</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-800">{t('completedToday')}</span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">{metrics?.completed_today_count || 0}</span>
            <span className="text-xs text-slate-500 font-medium">
              avg {metrics?.avg_review_time_minutes || 4.8} min
            </span>
          </div>
        </Card>
      </div>

      {/* Emergency Triage Queue Preview Table */}
      <Card
        title="Pending Clinical Reviews & Triage Queue"
        subtitle="Sorted by emergency priority, hard red-flag status, risk score, and arrival timestamp."
        action={
          <Link href="/doctor/queue" className="text-xs font-semibold text-teal-700 hover:text-teal-900">
            View All ({metrics?.pending_review_count || 0}) →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4">{t('patientId')}</th>
                <th className="py-3 px-4">{t('chiefComplaint')}</th>
                <th className="py-3 px-4">{t('triageCategory')}</th>
                <th className="py-3 px-4">{t('riskScore')}</th>
                <th className="py-3 px-4">{t('status')}</th>
                <th className="py-3 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentQueue.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    <div>{item.patient?.mrn_hash || item.patient_id}</div>
                    <div className="text-[10px] text-slate-400 font-sans font-normal">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-slate-800 truncate" title={item.chief_complaint}>
                      {item.chief_complaint}
                    </p>
                    {item.hard_red_flag_triggered && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 mt-1">
                        <ShieldAlert className="w-3 h-3" /> HARD RED FLAG
                      </span>
                    )}
                    {item.explainability_payload?.missing_vitals_warning && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 ml-1">
                        MISSING VITALS
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge category={item.calculated_category} />
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{item.calculated_risk_score}</span>
                      <span className="text-[10px] text-slate-400">/100</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/doctor/review/${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm"
                    >
                      {t('reviewPatient')} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
