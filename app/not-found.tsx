'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { AlertTriangle, Home, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-6">
      <Card>
        <div className="py-8 px-4 flex flex-col items-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
            The requested clinical workstation route or record does not exist or has been moved.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" leftIcon={<Home className="w-4 h-4" />} className="w-full">
                Return Home
              </Button>
            </Link>
            <Link href="/doctor/queue" className="w-full sm:w-auto">
              <Button variant="outline" leftIcon={<Activity className="w-4 h-4" />} className="w-full">
                Emergency Queue
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
