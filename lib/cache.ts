// In-memory LRU cache for weather data
// Reduces API calls and improves performance

import type { WeatherData } from './weather';
import { config } from './env';

// Cache entry interface
interface CacheEntry {
  data: WeatherData;
  timestamp: number;
  expiresAt: number;
}

// Weather cache class with LRU eviction and TTL support
export class WeatherCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxEntries: number;
  private readonly ttl: number;

  constructor(maxEntries = 10, ttl?: number) {
    this.cache = new Map<string, CacheEntry>();
    this.maxEntries = maxEntries;
    this.ttl = ttl || config.cache.ttl; // Use config TTL or default
  }

  // Clear all cached entries
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  get size(): number {
    return this.cache.size;
  }

  // Check if cache is enabled
  get isEnabled(): boolean {
    return config.cache.enabled;
  }

  // Get cached weather data with TTL validation
  get(location: { latitude: number; longitude: number }): WeatherData | null {
    // Check if cache is enabled
    if (!this.isEnabled) {
      return null;
    }

    const key = this.getCacheKey(location.latitude, location.longitude);
    const entry = this.cache.get(key);

    // No entry found
    if (!entry) {
      console.log(`Cache miss for location: ${key}`);
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now > entry.expiresAt) {
      console.log(`Cache expired for location: ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Move to end to maintain LRU order (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    console.log(`Cache hit for location: ${key}`);
    // Return cached data with cache source indicator
    return {
      ...entry.data,
      source: 'cache' as const,
    };
  }

  // Store weather data in cache with TTL
  set(location: { latitude: number; longitude: number }, data: WeatherData): void {
    // Check if cache is enabled
    if (!this.isEnabled) {
      return;
    }

    const key = this.getCacheKey(location.latitude, location.longitude);
    const now = Date.now();

    // Create cache entry
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + this.ttl,
    };

    // Check if we need to evict oldest entry (LRU)
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      // Remove the oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        console.log(`Evicting oldest cache entry: ${firstKey}`);
        this.cache.delete(firstKey);
      }
    }

    // Store or update the entry
    // Delete and re-add to move to end (most recently used)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    this.cache.set(key, entry);
    console.log(`Cached weather data for location: ${key}`);
  }

  // Generate cache key from coordinates
  private getCacheKey(latitude: number, longitude: number): string {
    // Round to 4 decimal places for consistent cache keys
    // This gives ~11m precision which is good enough for weather data
    const lat = latitude.toFixed(4);
    const lon = longitude.toFixed(4);
    return `${lat},${lon}`;
  }

  // Check if a location is cached
  has(location: { latitude: number; longitude: number }): boolean {
    const key = this.getCacheKey(location.latitude, location.longitude);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxEntries: number;
    ttl: number;
    enabled: boolean;
  } {
    return {
      size: this.size,
      maxEntries: this.maxEntries,
      ttl: this.ttl,
      enabled: this.isEnabled,
    };
  }
}

// Create singleton instance
export const weatherCache = new WeatherCache();
