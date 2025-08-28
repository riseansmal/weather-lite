'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">⚡</div>
            <h2 className="text-2xl font-bold">Application Error</h2>
            <p className="text-muted-foreground">
              A critical error occurred. Please refresh the page or try again later.
            </p>
            <div className="pt-4">
              <Button 
                onClick={reset}
                size="lg"
                className="min-w-[120px]"
              >
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

