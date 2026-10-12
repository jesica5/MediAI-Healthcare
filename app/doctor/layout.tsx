import React from 'react';
import { Sidebar } from '@/shared/components/doctor/layout/Sidebar';
import { AcademicDisclaimer } from '@/shared/components/doctor/layout/AcademicDisclaimer';
import { DoctorTopNav } from '@/shared/components/doctor/layout/DoctorTopNav';
import DoctorGuard from '@/shared/components/doctor/DoctorGuard';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorGuard>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 -mx-4 sm:-mx-6 lg:-mx-8 -my-8">
        <AcademicDisclaimer />
        <DoctorTopNav />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DoctorGuard>
  );
}
