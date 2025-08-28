'use client';

import { useEffect, useState, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  lastOnlineTime: number | null;
  wasOffline: boolean;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    lastOnlineTime: Date.now(),
    wasOffline: false,
  }));

  const updateNetworkStatus = useCallback((isOnline: boolean) => {
    setNetworkStatus(prev => ({
      isOnline,
      lastOnlineTime: isOnline ? Date.now() : prev.lastOnlineTime,
      wasOffline: !isOnline || prev.wasOffline,
    }));
  }, []);

  useEffect(() => {
    // Skip if SSR
    if (typeof window === 'undefined') return;

    // Set initial state
    updateNetworkStatus(navigator.onLine);

    const handleOnline = () => {
      updateNetworkStatus(true);
    };

    const handleOffline = () => {
      updateNetworkStatus(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check network status periodically as a fallback
    // Some browsers may not fire online/offline events reliably
    const intervalId = setInterval(() => {
      updateNetworkStatus(navigator.onLine);
    }, 5000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [updateNetworkStatus]);

  const resetWasOffline = useCallback(() => {
    setNetworkStatus(prev => ({ ...prev, wasOffline: false }));
  }, []);

  return {
    ...networkStatus,
    resetWasOffline,
  };
}

// Export a simpler hook for components that only need online/offline status
export function useOnlineStatus() {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}
