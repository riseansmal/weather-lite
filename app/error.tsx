'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl mb-4">🌩️</div>
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected error while loading the weather data. 
          This might be a temporary issue.
        </p>
        {error.message && (
          <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md font-mono">
            {error.message}
          </p>
        )}
        <div className="pt-4">
          <Button 
            onClick={reset}
            size="lg"
            className="min-w-[120px]"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

