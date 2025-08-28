// Weather code mappings based on WMO Weather interpretation codes (WW)
// https://open-meteo.com/en/docs#weathervariables
export const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
} as const;

// Weather icon mappings (emojis for simplicity, can be replaced with actual icons)
export const WEATHER_ICONS: Record<number, string> = {
  0: '☀️',    // Clear sky
  1: '🌤️',    // Mainly clear
  2: '⛅',    // Partly cloudy
  3: '☁️',    // Overcast
  45: '🌫️',   // Fog
  48: '🌫️',   // Depositing rime fog
  51: '🌦️',   // Light drizzle
  53: '🌦️',   // Moderate drizzle
  55: '🌦️',   // Dense drizzle
  56: '🌨️',   // Light freezing drizzle
  57: '🌨️',   // Dense freezing drizzle
  61: '🌧️',   // Slight rain
  63: '🌧️',   // Moderate rain
  65: '🌧️',   // Heavy rain
  66: '🌨️',   // Light freezing rain
  67: '🌨️',   // Heavy freezing rain
  71: '🌨️',   // Slight snow fall
  73: '❄️',    // Moderate snow fall
  75: '❄️',    // Heavy snow fall
  77: '🌨️',   // Snow grains
  80: '🌦️',   // Slight rain showers
  81: '🌧️',   // Moderate rain showers
  82: '⛈️',    // Violent rain showers
  85: '🌨️',   // Slight snow showers
  86: '❄️',    // Heavy snow showers
  95: '⛈️',    // Thunderstorm
  96: '⛈️',    // Thunderstorm with slight hail
  99: '⛈️',    // Thunderstorm with heavy hail
} as const;

// Temperature unit conversion constants
export const TEMP_UNITS = {
  CELSIUS: 'celsius',
  FAHRENHEIT: 'fahrenheit',
} as const;

export type TempUnit = typeof TEMP_UNITS[keyof typeof TEMP_UNITS];

// Temperature conversion functions
export const convertTemp = (temp: number, to: TempUnit): number => {
  if (to === TEMP_UNITS.FAHRENHEIT) {
    return Math.round((temp * 9) / 5 + 32);
  }
  return Math.round(temp);
};

// API endpoints
export const API_ENDPOINTS = {
  WEATHER: 'https://api.open-meteo.com/v1/forecast',
  GEOCODING: 'https://geocoding-api.open-meteo.com/v1/search',
  IP_LOCATION: 'http://ip-api.com/json/',
} as const;

// Convenience exports for backward compatibility
export const WEATHER_API_BASE = API_ENDPOINTS.WEATHER;
export const GEOCODING_API_BASE = API_ENDPOINTS.GEOCODING;
export const IP_API_BASE = API_ENDPOINTS.IP_LOCATION;

// Default configuration values (fallbacks for env variables)
export const DEFAULT_CONFIG = {
  DEFAULT_CITY: 'San Francisco, California',
  DEFAULT_LAT: 37.7749,
  DEFAULT_LON: -122.4194,
  TEMP_UNIT: TEMP_UNITS.CELSIUS,
  API_TIMEOUT: 10000, // 10 seconds
  GEO_TIMEOUT: 5000,  // 5 seconds
  CACHE_TTL: 600000,  // 10 minutes
  REFRESH_INTERVAL: 600000, // 10 minutes
  ENABLE_AUTO_REFRESH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_CACHE: true,
} as const;

// Wind speed categories (km/h)
export const WIND_SPEED_CATEGORIES = {
  CALM: { min: 0, max: 5, label: 'Calm' },
  LIGHT: { min: 5, max: 20, label: 'Light' },
  MODERATE: { min: 20, max: 40, label: 'Moderate' },
  STRONG: { min: 40, max: 60, label: 'Strong' },
  GALE: { min: 60, max: 90, label: 'Gale' },
  STORM: { min: 90, max: Infinity, label: 'Storm' },
} as const;

// UV Index levels
export const UV_INDEX_LEVELS = {
  LOW: { min: 0, max: 2, label: 'Low', color: '#4ade80' },
  MODERATE: { min: 3, max: 5, label: 'Moderate', color: '#facc15' },
  HIGH: { min: 6, max: 7, label: 'High', color: '#fb923c' },
  VERY_HIGH: { min: 8, max: 10, label: 'Very High', color: '#f87171' },
  EXTREME: { min: 11, max: Infinity, label: 'Extreme', color: '#dc2626' },
} as const;

// Helper function to get wind category
export const getWindCategory = (speed: number): string => {
  for (const category of Object.values(WIND_SPEED_CATEGORIES)) {
    if (speed >= category.min && speed < category.max) {
      return category.label;
    }
  }
  return 'Unknown';
};

// Helper function to get UV index level
export const getUVIndexLevel = (index: number) => {
  for (const level of Object.values(UV_INDEX_LEVELS)) {
    if (index >= level.min && index <= level.max) {
      return level;
    }
  }
  return UV_INDEX_LEVELS.LOW;
};

// Date/Time formatting options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};

export const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

// Cache keys prefix
export const CACHE_KEYS = {
  WEATHER_DATA: 'weather_data_',
  USER_LOCATION: 'user_location',
  THEME_PREFERENCE: 'theme_preference',
} as const;

