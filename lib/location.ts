// Location detection system with fallback chain:
// 1. Browser Geolocation API
// 2. IP-based location
// 3. Default location

import { config } from './env';
import { IP_API_BASE } from './constants';

// Core location interface
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  source: 'gps' | 'ip' | 'manual' | 'default';
}

// Location error types
export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Location error interface
export interface LocationError {
  type: LocationErrorType;
  message: string;
  originalError?: Error | GeolocationPositionError;
}

// Browser permission states
export type LocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

// Options for location detection
export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  forceRefresh?: boolean;
}

// IP location API response type
export interface IPLocationResponse {
  status: string;
  lat?: number;
  lon?: number;
  city?: string;
  country?: string;
  message?: string;
}

// Cache entry for location data
export interface LocationCacheEntry {
  location: Location;
  timestamp: number;
  ttl: number;
}

// Constants for location detection
export const LOCATION_CONSTANTS = {
  GPS_TIMEOUT: 5000, // 5 seconds
  IP_TIMEOUT: 3000,  // 3 seconds
  CACHE_TTL: 300000, // 5 minutes
  HIGH_ACCURACY: true,
  MAX_AGE: 300000,   // 5 minutes
} as const;

// Helper function to convert GeolocationPositionError to LocationError
function convertGeolocationError(error: GeolocationPositionError): LocationError {
  let type: LocationErrorType;
  let message: string;

  switch (error.code) {
    case error.PERMISSION_DENIED:
      type = LocationErrorType.PERMISSION_DENIED;
      message = 'User denied location permission';
      break;
    case error.POSITION_UNAVAILABLE:
      type = LocationErrorType.POSITION_UNAVAILABLE;
      message = 'Location information is unavailable';
      break;
    case error.TIMEOUT:
      type = LocationErrorType.TIMEOUT;
      message = 'Location request timed out';
      break;
    default:
      type = LocationErrorType.UNKNOWN_ERROR;
      message = 'An unknown error occurred';
  }

  return {
    type,
    message,
    originalError: error,
  };
}

// Reverse geocode coordinates to get city and country names using OpenStreetMap Nominatim
export async function reverseGeocode(latitude: number, longitude: number): Promise<{ city?: string; country?: string }> {
  try {
    const params = new URLSearchParams({
      format: 'json',
      lat: latitude.toString(),
      lon: longitude.toString(),
      'accept-language': 'en',
      zoom: '10', // City level
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: {
        'User-Agent': 'WeatherLite/1.0 (https://github.com/riseansmal/weather-lite)', // Required by Nominatim
      },
    });

    if (!response.ok) {
      console.warn('Reverse geocoding failed:', response.status);
      return {};
    }

    const data = await response.json();
    if (!data.address) {
      return {};
    }

    const address = data.address;
    const city = address.city || address.town || address.village || address.hamlet || address.municipality;
    const country = address.country;

    return {
      city,
      country,
    };
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    return {};
  }
}

// Get location from browser's Geolocation API
export async function getBrowserLocation(options?: LocationOptions): Promise<Location> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!navigator?.geolocation) {
      reject({
        type: LocationErrorType.NOT_SUPPORTED,
        message: 'Geolocation is not supported by this browser',
      } as LocationError);
      return;
    }

    // Configure options with defaults
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? LOCATION_CONSTANTS.HIGH_ACCURACY,
      timeout: options?.timeout ?? LOCATION_CONSTANTS.GPS_TIMEOUT,
      maximumAge: options?.maximumAge ?? LOCATION_CONSTANTS.MAX_AGE,
    };

    // Success callback - handle async reverse geocoding properly
    const successCallback = (position: GeolocationPosition) => {
      const location: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: 'gps',
      };

      // Try to get city and country names via reverse geocoding
      reverseGeocode(location.latitude, location.longitude)
        .then(({ city, country }) => {
          if (city) location.city = city;
          if (country) location.country = country;
          resolve(location);
        })
        .catch((error) => {
          console.warn('Failed to get location names:', error);
          // Resolve with location even if reverse geocoding fails
          resolve(location);
        });
    };

    // Error callback
    const errorCallback = (error: GeolocationPositionError) => {
      reject(convertGeolocationError(error));
    };

    // Request current position
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      geolocationOptions
    );
  });
}

// Get location from IP-based geolocation service
export async function getIPLocation(): Promise<Location> {
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LOCATION_CONSTANTS.IP_TIMEOUT);

    // Make request to IP geolocation API
            const response = await fetch(IP_API_BASE, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`IP geolocation request failed with status: ${response.status}`);
    }

    // Parse response
    const data: IPLocationResponse = await response.json();

    // Check if the API returned success
    if (data.status !== 'success') {
      throw new Error(data.message || 'IP geolocation failed');
    }

    // Validate required fields
    if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
      throw new Error('Invalid location data received from IP geolocation');
    }

    // Create base location with coordinates
    const location: Location = {
      latitude: data.lat,
      longitude: data.lon,
      source: 'ip',
    };

    // Use reverse geocoding to get consistent city and country names
    try {
      const { city, country } = await reverseGeocode(location.latitude, location.longitude);
      if (city) location.city = city;
      if (country) location.country = country;
    } catch (error) {
      console.warn('Failed to reverse geocode IP location:', error);
      // Fallback to IP API data if reverse geocoding fails
      location.city = data.city;
      location.country = data.country;
    }

    return location;
  } catch (error) {
    // Handle different error types
    let locationError: LocationError;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        locationError = {
          type: LocationErrorType.TIMEOUT,
          message: 'IP geolocation request timed out',
          originalError: error,
        };
      } else if (error.message.includes('fetch')) {
        locationError = {
          type: LocationErrorType.NETWORK_ERROR,
          message: 'Network error during IP geolocation',
          originalError: error,
        };
      } else {
        locationError = {
          type: LocationErrorType.UNKNOWN_ERROR,
          message: error.message || 'Unknown error during IP geolocation',
          originalError: error,
        };
      }
    } else {
      locationError = {
        type: LocationErrorType.UNKNOWN_ERROR,
        message: 'Unknown error during IP geolocation',
      };
    }

    throw locationError;
  }
}

// In-memory cache for location data
let locationCache: LocationCacheEntry | null = null;

// Main location detection function with fallback chain
export async function detectLocation(options?: LocationOptions): Promise<Location> {
  // Check cache first if not forcing refresh
  if (!options?.forceRefresh && locationCache) {
    const now = Date.now();
    if (now - locationCache.timestamp < locationCache.ttl) {
      console.log('Using cached location');
      return locationCache.location;
    }
  }

  let location: Location;
  const errors: LocationError[] = [];

  // Step 1: Try browser geolocation
  try {
    console.log('Attempting browser geolocation...');
    location = await getBrowserLocation(options);
    console.log('Successfully obtained GPS location');
  } catch (error) {
    console.warn('Browser geolocation failed:', error);
    errors.push(error as LocationError);

    // Step 2: Try IP-based location
    try {
      console.log('Falling back to IP geolocation...');
      location = await getIPLocation();
      console.log('Successfully obtained IP-based location');
    } catch (ipError) {
      console.warn('IP geolocation failed:', ipError);
      errors.push(ipError as LocationError);

      // Step 3: Use default location with reverse geocoding
      console.log('Using default location');
      location = {
        latitude: config.location.defaultLat,
        longitude: config.location.defaultLon,
        source: 'default',
      };

      // Use reverse geocoding to get consistent city and country names for default location
      try {
        const { city, country } = await reverseGeocode(location.latitude, location.longitude);
        if (city) location.city = city;
        if (country) location.country = country;
      } catch (error) {
        console.warn('Failed to reverse geocode default location:', error);
        // Fallback to config value if reverse geocoding fails
        location.city = config.location.defaultCity;
      }
    }
  }

  // Cache the successful location
  locationCache = {
    location,
    timestamp: Date.now(),
    ttl: LOCATION_CONSTANTS.CACHE_TTL,
  };

  return location;
}

// Clear the location cache
export function clearLocationCache(): void {
  locationCache = null;
}

// Check geolocation permission state
export async function checkPermissionState(): Promise<LocationPermissionState> {
  // Check if the browser supports the permissions API
  if (!navigator?.permissions) {
    console.warn('Permissions API not supported');
    return 'unsupported';
  }

  try {
    // Query the geolocation permission state
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state as LocationPermissionState;
  } catch (error) {
    console.error('Error checking geolocation permission:', error);
    return 'unsupported';
  }
}

// Get current cached location if available
export function getCachedLocation(): Location | null {
  if (!locationCache) {
    return null;
  }

  const now = Date.now();
  if (now - locationCache.timestamp < locationCache.ttl) {
    return locationCache.location;
  }

  // Cache has expired
  locationCache = null;
  return null;
}

// Location service API
export const locationService = {
  detectLocation,
  getBrowserLocation,
  getIPLocation,
  checkPermissionState,
  getCachedLocation,
  clearLocationCache,
} as const;
