'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuth } from '@/shared/context/AuthContext';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { Button } from '@/shared/components/Button';
import { Alert } from '@/shared/components/Alert';
import { LoadingState } from '@/shared/components/LoadingState';
import { ErrorState } from '@/shared/components/ErrorState';
import { PrivacyNotice } from '@/shared/components/PrivacyNotice';
import { Input } from '@/shared/components/Input';
import {
  UserCheck,
  Calendar,
  Globe,
  Hash,
  ShieldAlert,
  ArrowLeft,
  FileCheck,
  LogOut,
  Sparkles,
  Activity,
  HeartPulse,
  Stethoscope,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Database,
  BrainCircuit,
} from 'lucide-react';

interface PatientProfileData {
  id: string;
  mrnHash: string;
  dateOfBirth: string;
  gender: string;
  primaryLanguage: string;
  createdAt: string;
  intakeStatus: string;
  nextStep: string;
  latestRiskPrediction?: any;
}

export default function PatientProfilePage() {
  const { t, language } = useLanguage();
  const { role, user, patientSessionToken, signOut } = useAuth();

  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gemini AI Risk Prediction Form state
  const [chiefComplaint, setChiefComplaint] = useState('Chest pain and mild dyspnea on exertion');
  const [symptoms, setSymptoms] = useState('Chest pressure, shortness of breath, dizziness');
  const [heartRate, setHeartRate] = useState('98');
  const [bloodPressure, setBloodPressure] = useState('135/85');
  const [spo2, setSpo2] = useState('95');
  const [temp, setTemp] = useState('37.2');
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = patientSessionToken || 'pt_token_default';
      const response = await fetch('/api/v1/patients/me', {
        headers: {
          'x-patient-token': token,
        },
      });

      const envelope = await response.json();
      if (!response.ok || envelope.error) {
        setError(envelope.error?.message || 'Unauthorized or expired session.');
      } else {
        setProfile(envelope.data.patient);
        if (envelope.data.patient?.latestRiskPrediction) {
          setPredictionResult(envelope.data.patient.latestRiskPrediction);
        }
      }
    } catch {
      setError('Unable to fetch patient profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [patientSessionToken]);

  const handlePredictRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setAiError(null);

    try {
      const symptomsList = symptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/ai/risk-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: profile?.id || 'pt_demo_1002',
          chiefComplaint,
          symptoms: symptomsList,
          vitals: {
            heartRate: Number(heartRate) || undefined,
            bloodPressure: bloodPressure || undefined,
            oxygenSaturation: Number(spo2) || undefined,
            temperatureCelsius: Number(temp) || undefined,
          },
          primaryLanguage: language,
          age: 38,
          gender: profile?.gender || 'FEMALE',
        }),
      });

      const envelope = await res.json();
      if (!res.ok || envelope.error) {
        setAiError(envelope.error?.message || 'Failed to generate AI risk prediction.');
      } else {
        setPredictionResult(envelope.data.prediction);
      }
    } catch {
      setAiError('Network error while requesting Gemini AI prediction.');
    } finally {
      setIsPredicting(false);
    }
  };

  const getAcuityBadgeVariant = (acuity?: string): 'critical' | 'high' | 'moderate' | 'low' => {
    switch (acuity) {
      case 'CRITICAL':
        return 'critical';
      case 'HIGH':
        return 'high';
      case 'MODERATE':
        return 'moderate';
      default:
        return 'low';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <Link href="/patient/intake">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {t.profile.backToIntake}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="info" className="gap-1">
            <Database className="w-3 h-3" />
            <span>Firebase & Firestore Active</span>
          </Badge>
          <Badge variant="info">{role}</Badge>
          {patientSessionToken && (
            <Button variant="outline" size="sm" onClick={signOut} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
              {t.nav.signOut}
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.profile.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cloud Firestore Patient Profile & Google Gemini AI Risk Assessment
                </p>
              </div>
            </div>
            <Badge variant="success" className="gap-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{t.profile.statusCompleted}</span>
            </Badge>
          </div>
        }
      >
        {isLoading ? (
          <LoadingState message="Retrieving patient record from Cloud Firestore..." />
        ) : error ? (
          <ErrorState
            title="Access Restricted"
            message={error}
            onRetry={fetchProfile}
          />
        ) : profile ? (
          <div className="space-y-8">
            {/* Status Alert Banner */}
            <Alert variant="info" title="Patient Intake Record synchronized with Cloud Firestore">
              Demographics and MRN hash are securely stored. Ready for Google Gemini AI risk prediction.
            </Alert>

            {/* Profile Field Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Hash className="w-4 h-4 text-brand-500" />
                  <span>{t.profile.mrnHash}</span>
                </div>
                <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white break-all">
                  {profile.mrnHash}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span>{t.profile.dob}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.dateOfBirth}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <UserCheck className="w-4 h-4 text-brand-500" />
                  <span>{t.profile.gender}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.gender}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Globe className="w-4 h-4 text-brand-500" />
                  <span>{t.profile.language}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.primaryLanguage === 'ta' ? 'Tamil (தமிழ்)' : 'English'}
                </p>
              </div>
            </div>

            {/* AI Risk Prediction Module Section */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <span>Google Gemini AI Risk Prediction</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                        gemini-2.5-flash
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Server-side symptom analysis, clinical acuity estimation, and risk explanations
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePredictRisk} className="space-y-4">
                {aiError && (
                  <Alert variant="error" title="AI Service Error">
                    {aiError}
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Chief Complaint
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="e.g. Severe chest pain radiating to left arm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Symptoms (comma separated)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Shortness of breath, dizziness, sweating"
                      required
                    />
                  </div>
                </div>

                {/* Vitals inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  isLoading={isPredicting}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                >
                  {isPredicting ? 'Analyzing via Gemini API...' : 'Run Gemini AI Risk Prediction'}
                </Button>
              </form>

              {/* Prediction Results Card */}
              {predictionResult && (
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={getAcuityBadgeVariant(predictionResult.acuityLevel)} className="text-xs font-bold">
                        Acuity Level: {predictionResult.acuityLevel}
                      </Badge>
                      <span className="text-xs text-slate-300 font-mono font-semibold">
                        Risk Score: {predictionResult.riskScore}/100
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 italic">
                      Model: {predictionResult.aiModel || 'Google Gemini API'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4" />
                        <span>Clinical Rationale (Staff View)</span>
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {predictionResult.clinicalRationale}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4" />
                        <span>Patient Explanation ({language === 'ta' ? 'Tamil' : 'English'})</span>
                      </h4>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {predictionResult.patientFriendlyExplanation}
                      </p>
                    </div>
                  </div>

                  {predictionResult.recommendedTriageCategory && (
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                      <span className="font-bold">Recommended Triage Category: </span>
                      <span>{predictionResult.recommendedTriageCategory}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Privacy Rule Notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 flex items-start gap-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{t.profile.notice}</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                  Direct cross-patient record access is governed by Firebase Authentication and server-side RBAC.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link href="/patient/intake" className="flex-1">
                <Button variant="outline" className="w-full">
                  {t.profile.backToIntake}
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="secondary" className="w-full">
                  {t.profile.backToHome}
                </Button>
              </Link>
            </div>
          </div>
        ) : null}
      </Card>

      <PrivacyNotice />
    </div>
  );
}
