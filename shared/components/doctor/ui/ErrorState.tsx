import React from 'react';
import { ApiError } from '@/shared/types';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  error: ApiError | string | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const code = typeof error === 'object' && error ? error.code : 'ERROR';
  const message = typeof error === 'object' && error ? error.message : String(error || 'An unexpected error occurred.');

  return (
    <div className="py-10 px-6 bg-red-50/70 border border-red-200 rounded-xl flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <span className="text-xs font-mono font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md mb-2">
        ERROR_CODE: {code}
      </span>
      <h3 className="text-base font-semibold text-red-950 mb-1">Clinical Request Failed</h3>
      <p className="text-xs text-red-800 max-w-lg mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="bg-white hover:bg-red-50 border-red-300 text-red-800">
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry Clinical Request
        </Button>
      )}
    </div>
  );
}
