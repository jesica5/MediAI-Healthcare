'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { LoadingState } from '@/shared/components/LoadingState';

export default function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== 'Attending Doctor') {
      router.replace('/signin');
    }
  }, [isLoading, role, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (role !== 'Attending Doctor') {
    return null;
  }

  return <>{children}</>;
}
