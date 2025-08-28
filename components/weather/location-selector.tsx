'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Location, reverseGeocode } from '@/lib/location';
import { Search, Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  onLocationChange: (location: Location) => void;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export function LocationSelector({ onLocationChange, className }: LocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    // Validate input
    if (query.trim().length < 2) {
      setError('City name must be at least 2 characters');
      return;
    }

    if (query.trim().length > 100) {
      setError('City name is too long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use Nominatim search API for forward geocoding
      const params = new URLSearchParams({
        q: query.trim(),
        format: 'json',
        limit: '1',
        'accept-language': 'en',
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'WeatherLite/1.0 (https://github.com/riseansmal/weather-lite)',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Location search failed with status: ${response.status}`);
      }

      const data: NominatimResult[] = await response.json();

      if (!data || data.length === 0) {
        setError('City not found. Please check the spelling and try again.');
        return;
      }

      const result = data[0];
      
      // Create base location with coordinates from search
      const location: Location = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        source: 'manual',
      };

      // Use the SAME reverse geocoding method as browser location for consistency
      try {
        const { city, country } = await reverseGeocode(location.latitude, location.longitude);
        if (city) location.city = city;
        if (country) location.country = country;
      } catch (error) {
        console.warn('Failed to reverse geocode manual location:', error);
        // Fallback to display name if reverse geocoding fails
        location.city = result.display_name.split(',')[0].trim();
      }

      onLocationChange(location);

      // Clear the search field on successful selection
      setQuery('');
      setError('');
    } catch (err) {
      console.error('Location search error:', err);
      setError('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && query.trim().length >= 2) {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Basic validation for special characters
    if (/^[a-zA-Z0-9\s,.-]*$/.test(value) || value === '') {
      setQuery(value);
      if (error) setError(''); // Clear error when user starts typing
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          maxLength={100}
          aria-label="City search"
          aria-describedby={error ? 'location-error' : undefined}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || query.trim().length < 2}
          aria-label="Search for city"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && (
        <p 
          id="location-error" 
          className="text-sm text-destructive mt-2"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
