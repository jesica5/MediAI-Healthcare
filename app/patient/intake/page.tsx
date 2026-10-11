'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuth } from '@/shared/context/AuthContext';
import { validatePatientIntake } from '@/shared/utils/validation';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Select } from '@/shared/components/Select';
import { Button } from '@/shared/components/Button';
import { Alert } from '@/shared/components/Alert';
import { PrivacyNotice } from '@/shared/components/PrivacyNotice';
import {
  UserCheck,
  Calendar,
  User,
  Globe,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Gender, Language } from '@/shared/types';

export default function PatientIntakePage() {
  const { t, language } = useLanguage();
  const { setPatientSessionToken } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [primaryLanguage, setPrimaryLanguage] = useState<Language>(language);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    mrnHash: string;
    sessionToken: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // 1. Client-side Validation
    const validation = validatePatientIntake({
      name,
      dateOfBirth,
      gender: gender as Gender,
      primaryLanguage,
    });

    if (!validation.isValid) {
      const errMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        if (err.field) errMap[err.field] = err.issue;
      });
      setErrors(errMap);
      return;
    }

    // 2. Submit to Server API Endpoint
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          dateOfBirth,
          gender,
          primaryLanguage,
        }),
      });

      const envelope = await response.json();

      if (!response.ok || envelope.error) {
        setServerError(
          envelope.error?.message || 'Failed to submit patient intake data.'
        );
        if (envelope.error?.details) {
          const errMap: Record<string, string> = {};
          envelope.error.details.forEach(
            (detail: { field?: string; issue: string }) => {
              if (detail.field) errMap[detail.field] = detail.issue;
            }
          );
          setErrors(errMap);
        }
      } else {
        // Success
        const data = envelope.data;
        setSubmittedData({
          id: data.id,
          mrnHash: data.mrnHash,
          sessionToken: data.sessionToken,
        });
        setPatientSessionToken(data.sessionToken);
      }
    } catch {
      setServerError('Network error. Input preserved — please retry submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDateOfBirth('');
    setGender('');
    setSubmittedData(null);
    setErrors({});
    setServerError(null);
  };

  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card
          header={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.intake.successTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.intake.successDesc}
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <Alert variant="success" title="Intake Registered Successfully">
              Demographic record created with AES-256 encrypted name and SHA-256 MRN identifier hash.
            </Alert>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-sans font-bold">
                {t.intake.mrnLabel}
              </div>
              <div className="break-all text-brand-300 select-all font-semibold">
                {submittedData.mrnHash}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => router.push('/patient/profile')}
                leftIcon={<UserCheck className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t.intake.viewProfile}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                {t.intake.newIntake}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      <Card
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.intake.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.intake.subtitle}
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <Alert variant="error" title={t.common.error}>
              {serverError}
            </Alert>
          )}

          {isSubmitting && (
            <Alert variant="warning" title="Processing Submission">
              {t.intake.duplicateWarning}
            </Alert>
          )}

          {/* Full Name */}
          <Input
            label={t.intake.nameLabel}
            name="name"
            placeholder={t.intake.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            helpText={t.intake.nameHelp}
            required
            leftIcon={<User className="w-4 h-4" />}
          />

          {/* Date of Birth & Gender Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t.intake.dobLabel}
              type="date"
              name="dateOfBirth"
              placeholder={t.intake.dobPlaceholder}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              error={errors.dateOfBirth}
              required
              leftIcon={<Calendar className="w-4 h-4" />}
            />

            <Select
              label={t.intake.genderLabel}
              name="gender"
              placeholder={t.intake.selectGender}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              options={[
                { value: 'MALE', label: t.intake.genderOptions.MALE },
                { value: 'FEMALE', label: t.intake.genderOptions.FEMALE },
                { value: 'OTHER', label: t.intake.genderOptions.OTHER },
                {
                  value: 'PREFER_NOT_TO_SAY',
                  label: t.intake.genderOptions.PREFER_NOT_TO_SAY,
                },
              ]}
              error={errors.gender}
              required
            />
          </div>

          {/* Preferred Language */}
          <Select
            label={t.intake.languageLabel}
            name="primaryLanguage"
            value={primaryLanguage}
            onChange={(e) => setPrimaryLanguage(e.target.value as Language)}
            options={[
              { value: 'en', label: t.intake.languageOptions.en },
              { value: 'ta', label: t.intake.languageOptions.ta },
            ]}
            error={errors.primaryLanguage}
            required
          />

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-5 h-5" />}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {isSubmitting ? t.intake.submitting : t.intake.submitButton}
            </Button>
          </div>
        </form>
      </Card>

      <PrivacyNotice />
    </div>
  );
}
