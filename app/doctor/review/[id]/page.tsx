'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { doctorService } from '@/shared/services/doctorService';
import { TriageAssessment, AcuityCategory } from '@/shared/types/triage';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { useAuth } from '@/shared/context/AuthContext';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Badge } from '@/shared/components/doctor/ui/Badge';
import { Alert } from '@/shared/components/doctor/ui/Alert';
import { Button } from '@/shared/components/doctor/ui/Button';
import { Select } from '@/shared/components/doctor/ui/Select';
import { Modal } from '@/shared/components/doctor/ui/Modal';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { VitalTrendsChart } from '@/shared/components/charts/VitalTrendsChart';
import { ExplainabilityChart } from '@/shared/components/charts/ExplainabilityChart';
import { ACUITY_CONFIGS } from '@/shared/constants/doctorAcuity';
import { VITAL_SAFETY_BASELINES } from '@/shared/constants/safety';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  User,
  Heart,
  Thermometer,
  Wind,
  Gauge,
  HelpCircle,
} from 'lucide-react';

// Next 14 params: plain object, not a Promise
export default function PatientReviewPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { t } = useDoctorTranslation();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<TriageAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Override Console State
  const [selectedCategory, setSelectedCategory] = useState<AcuityCategory>('CRITICAL');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [confirmedResult, setConfirmedResult] = useState<any>(null);

  const fetchAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getPatientAssessmentById(id);
      if (res.error) throw new Error(res.error.message);
      if (res.data) {
        setAssessment(res.data);
        setSelectedCategory(res.data.calculated_category);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching patient review record');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  const handleOpenConfirmModal = () => {
    setValidationError(null);
    if (!assessment) return;

    const isCategoryChanged = selectedCategory !== assessment.calculated_category;

    // Red flag safety enforcement: Hard red flag P1 Critical requires mandatory rationale (min 15 chars)
    if (assessment.hard_red_flag_triggered && assessment.calculated_category === 'CRITICAL' && selectedCategory !== 'CRITICAL') {
      if (!overrideReason || overrideReason.trim().length < 15) {
        setValidationError(
          'SAFETY RULE ENFORCEMENT: A Tier-1 Physiological Red Flag was triggered on this patient. Downgrading a Critical result requires detailed clinical justification (minimum 15 characters).'
        );
        return;
      }
    }

    // General rationale check if overriding category
    if (isCategoryChanged && (!overrideReason || overrideReason.trim() === '')) {
      setValidationError('Clinical override rationale is mandatory when modifying the calculated triage category.');
      return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!assessment) return;
    if (!user?.id) {
      setValidationError('No authenticated doctor session found. Please sign in again.');
      return;
    }
    setSubmitting(true);
    setValidationError(null);

    try {
      const payload = {
        assessment_id: assessment.id,
        doctor_id: user.id,
        final_category: selectedCategory,
        override_reason: overrideReason,
        clinical_notes: clinicalNotes,
      };

      const res = await doctorService.submitDoctorOverride(payload);

      if (res.error) {
        setValidationError(res.error.message);
        setIsModalOpen(false);
        return;
      }

      setConfirmedResult(res.data);
      setSubmissionSuccess(true);
      setIsModalOpen(false);
      // Refresh assessment state
      fetchAssessment();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Failed to process override request.');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Retrieving detailed clinical workspace..." />;
  if (error || !assessment) return <ErrorState error={error || 'Assessment not found'} onRetry={fetchAssessment} />;

  const patient = assessment.patient;
  const vitals = assessment.vitals;
  const explainability = assessment.explainability_payload;
  const isMissingVitals = explainability?.missing_vitals_warning;

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/queue"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Back to Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {patient?.display_name || 'Patient Clinical Review'}
              </h2>
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {patient?.mrn_hash}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Assessed on {new Date(assessment.created_at).toLocaleString()} • Primary Language: {patient?.primary_language === 'ta' ? 'Tamil' : 'English'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge category={assessment.calculated_category} />
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Calculated Risk</span>
            <span className="text-lg font-black font-mono text-slate-900">{assessment.calculated_risk_score}/100</span>
          </div>
        </div>
      </div>

      {/* Submission Success Confirmation Banner */}
      {submissionSuccess && (
        <Alert
          type="success"
          title="Physician Review & Clinical Sign-Off Completed Successfully"
          action={
            <Button size="sm" variant="outline" onClick={() => setSubmissionSuccess(false)}>
              Dismiss
            </Button>
          }
        >
          <p className="text-xs">
            Server response recorded in immutable audit log. Status: <strong className="font-mono">{confirmedResult?.status}</strong> • Final Category: <strong className="font-mono">{confirmedResult?.final_category}</strong>.
          </p>
        </Alert>
      )}

      {/* Hard Red Flag Alert Banner */}
      {assessment.hard_red_flag_triggered && (
        <Alert type="danger" title="HARD PHYSIOLOGICAL RED-FLAG TRIGGERED">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-red-950">
              Deterministic Safety Pre-Check bypasses probabilistic ML model inference. Immediate Bay Allocation (Priority 1 Critical) is enforced.
            </p>
            <ul className="list-disc list-inside text-xs space-y-0.5 text-red-900">
              {assessment.red_flag_details.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {/* Missing Vital Warning Banner */}
      {isMissingVitals && (
        <Alert type="warning" title="MISSING ESSENTIAL VITAL SIGN WARNING">
          <p className="text-xs leading-relaxed">
            Essential physiological inputs ({explainability.missing_vitals_list?.join(', ')}) were not captured during intake. Model confidence reduced to <strong>{Math.round(assessment.confidence_score * 100)}%</strong>. Enforce bedside manual measurement before final discharge disposition.
          </p>
        </Alert>
      )}

      {/* 2-Column Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinical Information & Trends (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chief Complaint & Symptoms */}
          <Card title="Chief Complaint & Reported Symptoms">
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Chief Complaint</span>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">{assessment.chief_complaint}</p>
              </div>

              {patient?.medical_history && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1.5">{t('medicalHistory')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.medical_history.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-lg border border-slate-200 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recorded Vital Signs Snapshot Grid */}
          <Card title="Recorded Physiological Vital Signs Snapshot">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Heart className="w-4 h-4 text-red-500" /> Heart Rate
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{vitals?.heart_rate ?? 'N/A'}</span>
                  <span className="text-xs text-slate-500">bpm</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Gauge className="w-4 h-4 text-sky-500" /> Blood Pressure
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {vitals?.systolic_bp && vitals?.diastolic_bp ? `${vitals.systolic_bp}/${vitals.diastolic_bp}` : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-500">mmHg</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Wind className="w-4 h-4 text-teal-600" /> SpO2 Saturation
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-lg font-bold font-mono ${vitals?.oxygen_saturation === null ? 'text-amber-600' : 'text-slate-900'}`}>
                    {vitals?.oxygen_saturation !== null && vitals?.oxygen_saturation !== undefined ? `${vitals.oxygen_saturation}%` : 'UNRECORDED'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Activity className="w-4 h-4 text-orange-500" /> Resp. Rate
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{vitals?.respiratory_rate ?? 'N/A'}</span>
                  <span className="text-xs text-slate-500">bpm</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Thermometer className="w-4 h-4 text-amber-500" /> Temperature
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{vitals?.temperature_celsius ?? 'N/A'}</span>
                  <span className="text-xs text-slate-500">°C</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <FileText className="w-4 h-4 text-purple-500" /> Capillary Glucose
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{vitals?.capillary_blood_glucose ?? 'N/A'}</span>
                  <span className="text-xs text-slate-500">mg/dL</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Vital Signs Trends Chart */}
          <Card title="Vital-Sign Trends Over Time (Trajectory Analysis)" subtitle="Tracks historical physiological changes to detect acute deterioration trends.">
            <VitalTrendsChart history={assessment.vitals_history || (vitals ? [vitals] : [])} />
          </Card>

          {/* TreeSHAP Explainability Attribution */}
          <Card
            title="Explainable AI Risk Attribution (TreeSHAP)"
            subtitle="Machine learning feature contribution breakdown explaining calculated acuity band."
          >
            <ExplainabilityChart payload={explainability} />
          </Card>
        </div>

        {/* Right Column: Physician Review & Override Console (1 col) */}
        <div className="space-y-6">
          <Card
            title="Doctor Review & Override Console"
            subtitle="Approved API: POST /api/v1/doctor/override"
            className="border-slate-300 shadow-md sticky top-20"
          >
            {validationError && (
              <Alert type="danger" className="mb-4">
                {validationError}
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Server Calculated Category:</span>
                <Badge category={assessment.calculated_category} />
              </div>

              <Select
                label="Final Permitted Acuity Category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as AcuityCategory)}
                options={[
                  { value: 'CRITICAL', label: 'Critical (Priority 1 - Immediate)' },
                  { value: 'HIGH', label: 'High (Priority 2 - 15-30 min)' },
                  { value: 'MODERATE', label: 'Moderate (Priority 3 - 60 min)' },
                  { value: 'LOW', label: 'Low (Priority 4 - Routine 120 min)' },
                ]}
              />

              {selectedCategory !== assessment.calculated_category && (
                <Alert type="warning" title="Clinical Override Active">
                  <p className="text-xs">
                    You are overriding the server-calculated category from <strong>{assessment.calculated_category}</strong> to <strong>{selectedCategory}</strong>.
                  </p>
                </Alert>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('mandatoryRationale')} {selectedCategory !== assessment.calculated_category && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder={t('rationalePlaceholder')}
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('clinicalNotes')}</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  placeholder={t('notesPlaceholder')}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                />
              </div>

              <Button variant="primary" className="w-full py-2.5 text-xs font-bold" onClick={handleOpenConfirmModal}>
                <CheckCircle2 className="w-4 h-4 mr-2 text-teal-400" /> Confirm & Submit Signed Review
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Physician Triage Sign-Off"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleConfirmSubmit}>
              Submit Final Assessment
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Please confirm your final clinical sign-off details:</p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div>Patient: {patient?.display_name} ({patient?.mrn_hash})</div>
            <div>Original Calculated Band: {assessment.calculated_category}</div>
            <div>Final Selected Band: {selectedCategory}</div>
            {overrideReason && <div>Rationale: &quot;{overrideReason}&quot;</div>}
          </div>
          <p className="text-[11px] text-slate-500">
            Submitting this sign-off will record an immutable audit entry in the PHI audit journal.
          </p>
        </div>
      </Modal>
    </div>
  );
}
