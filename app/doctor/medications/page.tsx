'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { doctorService } from '@/shared/services/doctorService';
import { MedicationRecord } from '@/shared/types/triage';
import { useDoctorTranslation } from '@/shared/hooks/useDoctorTranslation';
import { Card } from '@/shared/components/doctor/ui/Card';
import { Alert } from '@/shared/components/doctor/ui/Alert';
import { Badge } from '@/shared/components/doctor/ui/Badge';
import { Button } from '@/shared/components/doctor/ui/Button';
import { Select } from '@/shared/components/doctor/ui/Select';
import { LoadingState } from '@/shared/components/doctor/ui/LoadingState';
import { ErrorState } from '@/shared/components/doctor/ui/ErrorState';
import { Pill, ShieldAlert, CheckCircle2, Clock, FileCheck, Stethoscope, AlertTriangle } from 'lucide-react';

export default function DoctorMedicationsPage() {
  const { t } = useDoctorTranslation();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('p-101');
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getMedicationRecords(selectedPatientId);
      if (res.error) throw new Error(res.error.message);
      setMedications(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading medication history records');
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleReconcile = (medId: string) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              status: 'RECONCILED',
              reconciliation_notes:
                'Reconciled by Dr. Bhuvana M.V. during emergency intake review. Confirmed with bedside patient interview.',
              reconciled_by: 'Dr. Bhuvana M.V., MD',
              updated_at: new Date().toISOString(),
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t('medicationTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              Reconciliation Console
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('medicationSubtitle')}
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Select
            label={t('selectPatientRecord')}
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            options={[
              { value: 'p-101', label: 'Patient #849201 (Diabetes & HTN)' },
              { value: 'p-102', label: 'Patient #739104 (Severe Asthma)' },
              { value: 'p-104', label: 'Patient #610283 (COPD & Heart Failure)' },
            ]}
          />
        </div>
      </div>

      {/* Mandatory Scope Exclusion Safety Disclaimer Alert */}
      <Alert type="info" title="Academic Clinical Decision-Support Scope Notice">
        <div className="space-y-1">
          <p className="text-xs leading-relaxed">
            {t('medicationDisclaimer')}
          </p>
          <p className="text-[11px] text-slate-600 font-medium">
            This module provides clinician-entered medication reconciliation and outpatient history review only. No automated prescribing, dosage calculation, or pharmaceutical dispensing is permitted.
          </p>
        </div>
      </Alert>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching medication reconciliation records from server..." />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchMedications} />
      ) : medications.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Pill className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No Active Medication Records on File</p>
            <p className="text-[11px] text-slate-400">
              This patient has no chronic or outpatient medications recorded during intake.
            </p>
          </div>
        </Card>
      ) : (
        <Card
          title="Reported Medication History & Reconciliation Status"
          subtitle="Review outpatient pharmaceutical records, verify active dosages, and document clinical reconciliation."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" aria-label="Medication Reconciliation Records">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-4">{t('medicationName')}</th>
                  <th className="py-3.5 px-4">{t('reportedDosage')}</th>
                  <th className="py-3.5 px-4">{t('frequency')}</th>
                  <th className="py-3.5 px-4">{t('reconciliationStatus')}</th>
                  <th className="py-3.5 px-4">{t('clinicianNotes')}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {medications.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                        <span>{med.medication_name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-800">
                      {med.reported_dosage} {med.route ? `(${med.route})` : ''}
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-medium">{med.frequency}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md border ${
                          med.status === 'RECONCILED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {med.status === 'RECONCILED' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" aria-hidden="true" />
                        )}
                        {med.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 text-[11px] max-w-xs">
                      {med.reconciliation_notes || 'No reconciliation notes recorded.'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      {med.status === 'ACTIVE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReconcile(med.id)}
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" /> {t('reconcileRecord')}
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {med.reconciled_by || 'Dr. Bhuvana M.V.'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
