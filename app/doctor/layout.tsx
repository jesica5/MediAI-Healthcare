import React from 'react';
import { Sidebar } from '@/shared/components/doctor/layout/Sidebar';
import { AcademicDisclaimer } from '@/shared/components/doctor/layout/AcademicDisclaimer';
import DoctorGuard from '@/shared/components/doctor/DoctorGuard';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorGuard>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <AcademicDisclaimer />
        {/* No <Header> here — develop's root layout.tsx already renders the global Header on every page */}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">{children}</main>
        </div>
      </div>
    </DoctorGuard>
  );
}
