'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
  cooldownSeconds?: number;
  disabled?: boolean;
}

export function RefreshButton({ 
  onRefresh, 
  className,
  cooldownSeconds = 10,
  disabled = false
}: RefreshButtonProps) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  // Handle the refresh action
  const handleRefresh = useCallback(async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setCooldown(cooldownSeconds);

    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [cooldown, loading, onRefresh, cooldownSeconds]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const isDisabled = cooldown > 0 || loading || disabled;

  return (
    <Button
      onClick={handleRefresh}
      disabled={isDisabled}
      variant="outline"
      size="icon"
      className={cn("transition-all", className)}
      title={disabled ? 'Cannot refresh while offline' : cooldown > 0 ? `Wait ${cooldown}s before refreshing` : 'Refresh weather data'}
    >
      {cooldown > 0 ? (
        // Show countdown number instead of icon with smooth transition
        <span className="text-sm tabular-nums transition-all duration-300">
          {cooldown}
        </span>
      ) : (
        // Show refresh icon (spinning when loading)
        <RefreshCw 
          className={cn(
            "h-4 w-4 transition-all duration-300",
            loading && "animate-spin"
          )} 
        />
      )}
    </Button>
  );
}

// Custom hook for auto-refresh functionality
interface UseAutoRefreshOptions {
  enabled?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function useAutoRefresh(
  callback: () => void | Promise<void>,
  intervalMs: number,
  options: UseAutoRefreshOptions = {}
) {
  const { enabled = true, onVisibilityChange } = options;

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let intervalId: NodeJS.Timeout | null = null;
    let lastRefreshTime = Date.now();

    const startInterval = () => {
      // Clear existing interval if any
      if (intervalId) {
        clearInterval(intervalId);
      }

      // Set up new interval
      intervalId = setInterval(async () => {
        try {
          await callback();
          lastRefreshTime = Date.now();
        } catch (error) {
          console.error('Auto-refresh error:', error);
        }
      }, intervalMs);
    };

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      
      if (onVisibilityChange) {
        onVisibilityChange(isVisible);
      }

      if (isVisible) {
        // Resume auto-refresh when tab becomes visible
        // Check if enough time has passed since last refresh
        const timeSinceLastRefresh = Date.now() - lastRefreshTime;
        
        if (timeSinceLastRefresh >= intervalMs) {
          // Refresh immediately if interval has passed
          callback();
          lastRefreshTime = Date.now();
        }
        
        startInterval();
      } else {
        // Pause auto-refresh when tab is hidden
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    };

    // Initial setup
    if (!document.hidden) {
      startInterval();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [callback, intervalMs, enabled, onVisibilityChange]);
}
