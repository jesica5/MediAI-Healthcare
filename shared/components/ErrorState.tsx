import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'Failed to process request. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300">{title}</h3>
        <p className="text-xs text-rose-700 dark:text-rose-400">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="danger" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
