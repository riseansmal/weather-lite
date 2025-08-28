'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';

interface ClearCacheButtonProps {
  onCacheCleared?: () => void;
  className?: string;
}

export function ClearCacheButton({ onCacheCleared, className }: ClearCacheButtonProps) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = useCallback(async () => {
    if (isClearing) return;

    setIsClearing(true);
    
    try {
      // Clear localStorage
      localStorage.removeItem('weather-app-location');
      
      // Clear server-side caches (weather data cache, location cache)
      try {
        const response = await fetch('/api/clear-cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('Server caches cleared successfully');
        } else {
          console.warn('Failed to clear server caches');
        }
      } catch (error) {
        console.warn('Error clearing server caches:', error);
      }
      
      // Clear browser caches (service worker caches, etc.)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      console.log('All caches cleared successfully');
      
      // Callback to parent component
      if (onCacheCleared) {
        onCacheCleared();
      }

      // Optional: Reload the page to ensure all caches are truly cleared
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error clearing caches:', error);
    } finally {
      setIsClearing(false);
    }
  }, [isClearing, onCacheCleared]);

  return (
    <Button
      onClick={handleClearCache}
      disabled={isClearing}
      variant="outline"
      size="icon"
      className={className}
      title="Clear all caches and refresh"
      aria-label="Clear all caches and refresh"
    >
      {isClearing ? (
        <Trash2 className="h-4 w-4 animate-pulse" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
