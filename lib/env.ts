import { z } from 'zod';
import { DEFAULT_CONFIG, TEMP_UNITS } from './constants';

// Define the schema for environment variables
const envSchema = z.object({
  // Location settings
  NEXT_PUBLIC_DEFAULT_CITY: z.string().default(DEFAULT_CONFIG.DEFAULT_CITY),
  NEXT_PUBLIC_DEFAULT_LAT: z.coerce.number().min(-90).max(90).default(DEFAULT_CONFIG.DEFAULT_LAT),
  NEXT_PUBLIC_DEFAULT_LON: z.coerce.number().min(-180).max(180).default(DEFAULT_CONFIG.DEFAULT_LON),
  
  // Temperature unit
  NEXT_PUBLIC_TEMP_UNIT: z.enum([TEMP_UNITS.CELSIUS, TEMP_UNITS.FAHRENHEIT]).default(DEFAULT_CONFIG.TEMP_UNIT),
  
  // API timeout settings (in milliseconds)
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().min(1000).max(30000).default(DEFAULT_CONFIG.API_TIMEOUT),
  NEXT_PUBLIC_GEO_TIMEOUT: z.coerce.number().min(1000).max(15000).default(DEFAULT_CONFIG.GEO_TIMEOUT),
  
  // Cache settings (in milliseconds)
  NEXT_PUBLIC_CACHE_TTL: z.coerce.number().min(60000).max(3600000).default(DEFAULT_CONFIG.CACHE_TTL),
  
  // Refresh settings (in milliseconds)
  NEXT_PUBLIC_REFRESH_INTERVAL: z.coerce.number().min(60000).max(3600000).default(DEFAULT_CONFIG.REFRESH_INTERVAL),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_AUTO_REFRESH: z.coerce.boolean().default(DEFAULT_CONFIG.ENABLE_AUTO_REFRESH),
  NEXT_PUBLIC_ENABLE_DARK_MODE: z.coerce.boolean().default(DEFAULT_CONFIG.ENABLE_DARK_MODE),
  NEXT_PUBLIC_ENABLE_CACHE: z.coerce.boolean().default(DEFAULT_CONFIG.ENABLE_CACHE),
});

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables
const parseEnv = (): Env => {
  try {
    // In the browser, process.env is replaced by Next.js at build time
    const env = {
      NEXT_PUBLIC_DEFAULT_CITY: process.env.NEXT_PUBLIC_DEFAULT_CITY,
      NEXT_PUBLIC_DEFAULT_LAT: process.env.NEXT_PUBLIC_DEFAULT_LAT,
      NEXT_PUBLIC_DEFAULT_LON: process.env.NEXT_PUBLIC_DEFAULT_LON,
      NEXT_PUBLIC_TEMP_UNIT: process.env.NEXT_PUBLIC_TEMP_UNIT,
      NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
      NEXT_PUBLIC_GEO_TIMEOUT: process.env.NEXT_PUBLIC_GEO_TIMEOUT,
      NEXT_PUBLIC_CACHE_TTL: process.env.NEXT_PUBLIC_CACHE_TTL,
      NEXT_PUBLIC_REFRESH_INTERVAL: process.env.NEXT_PUBLIC_REFRESH_INTERVAL,
      NEXT_PUBLIC_ENABLE_AUTO_REFRESH: process.env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH,
      NEXT_PUBLIC_ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE,
      NEXT_PUBLIC_ENABLE_CACHE: process.env.NEXT_PUBLIC_ENABLE_CACHE,
    };

    const parsed = envSchema.parse(env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      // In development, throw to catch configuration errors early
      if (process.env.NODE_ENV === 'development') {
        throw new Error('Invalid environment variables');
      }
    }
    // In production, return defaults
    return envSchema.parse({});
  }
};

// Export the validated environment configuration
export const env = parseEnv();

// Helper function to get environment config
export const getEnvConfig = () => env;

// Type-safe access to specific config values
export const config = {
  location: {
    defaultCity: env.NEXT_PUBLIC_DEFAULT_CITY,
    defaultLat: env.NEXT_PUBLIC_DEFAULT_LAT,
    defaultLon: env.NEXT_PUBLIC_DEFAULT_LON,
  },
  units: {
    temperature: env.NEXT_PUBLIC_TEMP_UNIT,
  },
  timeouts: {
    api: env.NEXT_PUBLIC_API_TIMEOUT,
    geo: env.NEXT_PUBLIC_GEO_TIMEOUT,
  },
  cache: {
    ttl: env.NEXT_PUBLIC_CACHE_TTL,
    enabled: env.NEXT_PUBLIC_ENABLE_CACHE,
  },
  refresh: {
    interval: env.NEXT_PUBLIC_REFRESH_INTERVAL,
    autoRefresh: env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH,
  },
  features: {
    darkMode: env.NEXT_PUBLIC_ENABLE_DARK_MODE,
    cache: env.NEXT_PUBLIC_ENABLE_CACHE,
    autoRefresh: env.NEXT_PUBLIC_ENABLE_AUTO_REFRESH,
  },
} as const;

