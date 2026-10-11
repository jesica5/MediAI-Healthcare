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
import { Pill, ShieldAlert, CheckCircle2, Clock, FileCheck } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('medicationTitle')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Clinician-entered medication reconciliation & outpatient history review interface.
          </p>
        </div>

        <div className="w-64">
          <Select
            label="Select Patient Record"
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            options={[
              { value: 'p-101', label: 'Patient #849201 (Anonymized)' },
              { value: 'p-104', label: 'Patient #610283 (Anonymized)' },
            ]}
          />
        </div>
      </div>

      {/* Mandatory Scope Exclusion Safety Disclaimer Alert */}
      <Alert type="info" title="Academic Clinical Decision-Support Scope Notice">
        <p className="text-xs leading-relaxed">
          {t('medicationDisclaimer')} In strict compliance with the MediAI Master Project Specification v2.0, this interface is restricted to medication history review and clinical reconciliation only.
        </p>
      </Alert>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching medication reconciliation records..." />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchMedications} />
      ) : medications.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-xs text-slate-500">
            No active medication records on file for this patient.
          </div>
        </Card>
      ) : (
        <Card title="Reported Medication History & Reconciliation Status">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3.5 px-4">{t('medicationName')}</th>
                  <th className="py-3.5 px-4">{t('reportedDosage')}</th>
                  <th className="py-3.5 px-4">{t('frequency')}</th>
                  <th className="py-3.5 px-4">{t('reconciliationStatus')}</th>
                  <th className="py-3.5 px-4">Clinician Notes</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {medications.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-teal-600 shrink-0" /> {med.medication_name}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-800">{med.reported_dosage}</td>

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
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
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
                          onClick={() => {
                            setMedications(prev =>
                              prev.map(m =>
                                m.id === med.id
                                  ? {
                                      ...m,
                                      status: 'RECONCILED',
                                      reconciliation_notes: 'Reconciled by Dr. Bhuvana M.V. during emergency intake review.',
                                    }
                                  : m
                              )
                            );
                          }}
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1" /> Reconcile
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          Reconciled by {med.reconciled_by || 'Doctor'}
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
