'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  lastUpdate?: number;
  className?: string;
}

export function OfflineIndicator({ lastUpdate, className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Add event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Don't render if online
  if (isOnline) return null;

  return (
    <Alert className={className} variant="destructive">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        <span className="font-medium">No internet connection</span>
        {lastUpdate && (
          <span className="block text-xs mt-1">
            Showing cached data from {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
