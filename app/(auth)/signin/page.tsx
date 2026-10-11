'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuth } from '@/shared/context/AuthContext';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { Alert } from '@/shared/components/Alert';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function StaffSignInPage() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage(t.auth.invalidCredentials);
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      // Redirect to staff profile or home
      router.push('/patient/profile');
    } else {
      setErrorMessage(result.error || t.auth.invalidCredentials);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.auth.signInTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.auth.signInSubtitle}
              </p>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <Alert variant="error" title={t.auth.errorTitle}>
              {errorMessage}
            </Alert>
          )}

          <Input
            label={t.auth.emailLabel}
            type="email"
            name="email"
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label={t.auth.passwordLabel}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder={t.auth.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showPassword ? t.auth.hidePassword : t.auth.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLoading ? t.auth.signingIn : t.auth.signInButton}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Role resolution is strictly server-side verified against Supabase Auth.
          </p>
          <div className="flex justify-center gap-2 text-[10px] text-slate-400">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {t.auth.roles.nurse}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {t.auth.roles.doctor}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {t.auth.roles.admin}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
