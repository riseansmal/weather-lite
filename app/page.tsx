'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeatherDisplay, LocationSelector, CurrentWeatherSkeleton, ForecastCardSkeleton, RefreshButton, useAutoRefresh, OfflineIndicator, ClearCacheButton } from '@/components/weather';
import { ThemeToggle } from '@/components/theme-toggle';
import { useNetworkStatus } from '@/lib/hooks/use-network-status';
import { locationService, Location } from '@/lib/location';
import { WeatherData } from '@/lib/weather';
import { config } from '@/lib/env';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();

  // Fetch weather data for a given location
  const fetchWeatherData = useCallback(async (loc: Location, forceRefresh = false) => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams({
        lat: loc.latitude.toString(),
        lon: loc.longitude.toString(),
        city: loc.city || '',
        country: loc.country || '',
        source: loc.source,
        forceRefresh: forceRefresh.toString()
      });

      const response = await fetch(`/api/weather?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Weather request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setWeatherData(data.data);
        // Store location in localStorage for persistence
        localStorage.setItem('weather-app-location', JSON.stringify(loc));
      } else {
        throw new Error('Invalid weather data received');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle location change from LocationSelector
  const handleLocationChange = useCallback(async (newLocation: Location) => {
    setLocation(newLocation);
    await fetchWeatherData(newLocation);
  }, [fetchWeatherData]);

  // Detect current location
  const detectCurrentLocation = useCallback(async () => {
    setDetectingLocation(true);
    setError(null);
    try {
      const detectedLocation = await locationService.detectLocation({ forceRefresh: true });
      setLocation(detectedLocation);
      await fetchWeatherData(detectedLocation);
    } catch (err) {
      console.error('Location detection error:', err);
      setError('Failed to detect location. Using default location.');
      // Use default location as fallback
      const defaultLocation: Location = {
        latitude: config.location.defaultLat,
        longitude: config.location.defaultLon,
        city: config.location.defaultCity,
        source: 'default'
      };
      setLocation(defaultLocation);
      await fetchWeatherData(defaultLocation);
    } finally {
      setDetectingLocation(false);
    }
  }, [fetchWeatherData]);

  // Load weather data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Try to load location from localStorage first
      const storedLocation = localStorage.getItem('weather-app-location');
      if (storedLocation) {
        try {
          const parsedLocation = JSON.parse(storedLocation) as Location;
          setLocation(parsedLocation);
          await fetchWeatherData(parsedLocation);
        } catch (err) {
          console.error('Failed to load stored location:', err);
          // Fall back to location detection
          await detectCurrentLocation();
        }
      } else {
        // No stored location, detect current location
        await detectCurrentLocation();
      }
      
      setLoading(false);
    };

    loadInitialData();
  }, []); // Only run once on mount

  // Refresh weather data manually
  const refreshWeatherData = useCallback(async () => {
    if (location) {
      await fetchWeatherData(location, true);
    }
  }, [location, fetchWeatherData]);

  // Set up auto-refresh if enabled
  useAutoRefresh(
    refreshWeatherData,
    config.refresh.interval,
    {
      enabled: config.refresh.autoRefresh && !loading && !!location && isOnline,
      onVisibilityChange: (isVisible) => {
        console.log(`Tab visibility changed: ${isVisible ? 'visible' : 'hidden'}`);
      }
    }
  );

  // Auto-refresh when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && location) {
      console.log('Connection restored, refreshing weather data...');
      refreshWeatherData();
      resetWasOffline();
    }
  }, [isOnline, wasOffline, location, refreshWeatherData, resetWasOffline]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header with Location Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <h1 className="text-3xl font-bold">🌤️ Weather Lite</h1>
          
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <LocationSelector 
              onLocationChange={handleLocationChange}
              className="flex-1 sm:w-96"
            />
            <Button
              onClick={detectCurrentLocation}
              disabled={detectingLocation || !isOnline}
              variant="outline"
              size="icon"
              title={!isOnline ? "Location detection requires internet" : "Use current location"}
            >
              {detectingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
            </Button>
            {location && weatherData && (
              <RefreshButton 
                onRefresh={refreshWeatherData} 
                disabled={!isOnline}
              />
            )}
            <ClearCacheButton 
              onCacheCleared={() => {
                setLocation(null);
                setWeatherData(null);
                setError(null);
              }}
            />
            <ThemeToggle />
          </div>
        </div>

        {/* Offline Indicator */}
        {!isOnline && (
          <OfflineIndicator 
            lastUpdate={weatherData?.timestamp} 
            className="mb-4"
          />
        )}

        {/* Error Display */}
        {error && isOnline && (
          <Card className="mb-6 border-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Weather Display */}
        {loading ? (
          <div className="flex flex-col items-center space-y-8">
            <CurrentWeatherSkeleton />
                      <div className="w-full max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 text-center md:text-left">5-Day Forecast</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, i) => (
                <ForecastCardSkeleton key={i} />
              ))}
            </div>
          </div>
          </div>
        ) : weatherData ? (
          <WeatherDisplay data={weatherData} />
        ) : (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No weather data available. Please try searching for a location or enable location access.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Made with ❤️ by{' '}
              <a
                href="https://github.com/riseansmal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                Ri Sean Smal
              </a>
              {' • '}
              Released under{' '}
              <a 
                href="https://github.com/riseansmal/weather-lite/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors underline"
              >
                MIT License
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}