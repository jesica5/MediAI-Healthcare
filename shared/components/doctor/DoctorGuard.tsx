'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { LoadingState } from '@/shared/components/LoadingState';
import { ShieldAlert, Stethoscope, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading, signIn } = useAuth();
  const router = useRouter();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuickDoctorSignIn = async () => {
    setIsAuthorizing(true);
    setErrorMsg(null);
    try {
      const res = await signIn('doctor.bhuvana@mediai.hospital.org', 'DoctorPassword2026!');
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to authenticate doctor session');
      }
    } catch {
      setErrorMsg('Network error connecting to staff authentication service.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (isLoading || isAuthorizing) {
    return <LoadingState message="Verifying Attending Doctor Credentials & RBAC Security..." />;
  }

  // If role is authorized as Attending Doctor, render the protected children
  if (role === 'Attending Doctor') {
    return <>{children}</>;
  }

  // Unauthenticated / Role Mismatch State — Professional Clinical Authorization Prompt
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-teal-400 mx-auto flex items-center justify-center shadow-md">
          <Stethoscope className="w-7 h-7" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Hospital RBAC Guard Enforced
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Attending Physician Authorization Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            The Emergency Triage Workstation, Patient Queue, and Override Console are restricted to certified Attending Doctors in accordance with MediAI Master Specification Section 10.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium text-left">
            {errorMsg}
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> Authorized Roles:
          </div>
          <div className="text-[11px] text-slate-600 space-y-1 pl-5">
            <div>• Attending Emergency Physician (Full Review & Override)</div>
            <div>• Triage Nurse (Queue Review)</div>
            <div>• Current User Role: <span className="font-bold text-slate-900">{role || 'Unauthenticated'}</span></div>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleQuickDoctorSignIn}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            Authenticate as Attending Doctor (Dr. Bhuvana M.V.)
          </button>

          <Link
            href="/signin"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition-colors border border-slate-200"
          >
            Staff Sign-In Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
