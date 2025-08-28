// Weather API integration layer for Open-Meteo
// Handles fetching, validation, and transformation of weather data

import { z } from 'zod';
import { API_ENDPOINTS, WEATHER_CODES, WEATHER_ICONS } from './constants';
import { config } from './env';
import type { Location } from './location';

// Base API endpoint
const WEATHER_API_BASE = API_ENDPOINTS.WEATHER;

// Current weather data interface
export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  icon: string;
  time: string;
}

// Forecast day interface
export interface ForecastDay {
  date: string;
  dayOfWeek: string;
  temperatureMax: number;
  temperatureMin: number;
  condition: string;
  weatherCode: number;
  icon: string;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
}

// Location info for weather display
export interface WeatherLocation {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

// Main weather data structure
export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  location: WeatherLocation;
  timestamp: number;
  source: 'cache' | 'api';
}

// Weather error types
export enum WeatherErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Weather error interface
export interface WeatherError {
  type: WeatherErrorType;
  message: string;
  originalError?: Error;
}

// Weather fetch options
export interface WeatherFetchOptions {
  signal?: AbortSignal;
  forceRefresh?: boolean;
}

// Get human-readable weather condition from weather code
export function getWeatherCondition(code: number): string {
  return WEATHER_CODES[code] || 'Unknown';
}

// Get weather icon/emoji from weather code
export function getWeatherIcon(code: number): string {
  return WEATHER_ICONS[code] || '❓';
}

// Helper to get day of week from date string
export function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Helper to format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Zod schema for current weather from API
const CurrentWeatherSchema = z.object({
  temperature: z.number(),
  weathercode: z.number(),
  windspeed: z.number(),
  winddirection: z.number(),
  time: z.string(),
  is_day: z.number().optional(),
});

// Zod schema for hourly data (used for current conditions)
const HourlySchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  relativehumidity_2m: z.array(z.number()),
  apparent_temperature: z.array(z.number()),
  precipitation_probability: z.array(z.number()).optional(),
  weathercode: z.array(z.number()),
  surface_pressure: z.array(z.number()),
  visibility: z.array(z.number()).optional(),
  uv_index: z.array(z.number()).optional(),
});

// Zod schema for daily forecast data
const DailySchema = z.object({
  time: z.array(z.string()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  weathercode: z.array(z.number()),
  precipitation_sum: z.array(z.number()).optional(),
  precipitation_probability_max: z.array(z.number()).optional(),
  windspeed_10m_max: z.array(z.number()).optional(),
  uv_index_max: z.array(z.number()).optional(),
});

// Main weather response schema from Open-Meteo API
export const WeatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number().optional(),
  current_weather: CurrentWeatherSchema,
  hourly: HourlySchema.optional(),
  daily: DailySchema,
});

// Type for the validated weather response
export type WeatherResponse = z.infer<typeof WeatherResponseSchema>;

// Fetch raw weather data from Open-Meteo API
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  options?: WeatherFetchOptions
): Promise<WeatherResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current_weather: 'true',
      hourly: 'temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,weathercode,surface_pressure,visibility,uv_index',
      daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,precipitation_probability_max,windspeed_10m_max,uv_index_max',
      timezone: 'auto',
      forecast_days: '5',
    });

    // Add temperature unit if configured
    if (config.units.temperature === 'fahrenheit') {
      params.append('temperature_unit', 'fahrenheit');
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeouts.api
    );

    // Merge abort signals if one was provided
    const signal = options?.signal
      ? AbortSignal.any([controller.signal, options.signal])
      : controller.signal;

    // Make the API request
    const response = await fetch(`${WEATHER_API_BASE}?${params}`, {
      signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    // Check response status
    if (!response.ok) {
      throw new Error(`Weather API request failed with status: ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Validate response with Zod schema
    const validatedData = WeatherResponseSchema.parse(data);

    return validatedData;
  } catch (error) {
    // Handle different error types
    let weatherError: WeatherError;

    if (error instanceof z.ZodError) {
      weatherError = {
        type: WeatherErrorType.VALIDATION_ERROR,
        message: 'Invalid weather data received from API',
        originalError: error,
      };
    } else if (error instanceof Error) {
      if (error.name === 'AbortError') {
        weatherError = {
          type: WeatherErrorType.TIMEOUT,
          message: 'Weather API request timed out',
          originalError: error,
        };
      } else if (error.message.includes('fetch')) {
        weatherError = {
          type: WeatherErrorType.NETWORK_ERROR,
          message: 'Network error while fetching weather data',
          originalError: error,
        };
      } else if (error.message.includes('status')) {
        weatherError = {
          type: WeatherErrorType.API_ERROR,
          message: error.message,
          originalError: error,
        };
      } else {
        weatherError = {
          type: WeatherErrorType.UNKNOWN_ERROR,
          message: error.message || 'Unknown error while fetching weather',
          originalError: error,
        };
      }
    } else {
      weatherError = {
        type: WeatherErrorType.UNKNOWN_ERROR,
        message: 'Unknown error while fetching weather',
      };
    }

    throw weatherError;
  }
}

// Transform raw API response to application data format
export function transformWeatherResponse(
  response: WeatherResponse,
  location: Location
): WeatherData {
  // Get current hour index for hourly data
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  
  // Find the index of current hour in hourly data
  let currentHourIndex = 0;
  if (response.hourly) {
    const hourlyTimes = response.hourly.time;
    currentHourIndex = hourlyTimes.findIndex(time => {
      const hourDate = new Date(time);
      return hourDate.getDate() === currentTime.getDate() && 
             hourDate.getHours() === currentHour;
    });
    if (currentHourIndex === -1) currentHourIndex = 0;
  }

  // Transform current weather
  const current: CurrentWeather = {
    temperature: Math.round(response.current_weather.temperature),
    feelsLike: response.hourly?.apparent_temperature?.[currentHourIndex] 
      ? Math.round(response.hourly.apparent_temperature[currentHourIndex])
      : Math.round(response.current_weather.temperature),
    condition: getWeatherCondition(response.current_weather.weathercode),
    weatherCode: response.current_weather.weathercode,
    humidity: response.hourly?.relativehumidity_2m?.[currentHourIndex] ?? 0,
    windSpeed: Math.round(response.current_weather.windspeed),
    windDirection: response.current_weather.winddirection,
    pressure: response.hourly?.surface_pressure?.[currentHourIndex] 
      ? Math.round(response.hourly.surface_pressure[currentHourIndex])
      : 1013,
    uvIndex: response.hourly?.uv_index?.[currentHourIndex] ?? 0,
    visibility: response.hourly?.visibility?.[currentHourIndex] 
      ? Math.round(response.hourly.visibility[currentHourIndex] / 1000) // Convert to km
      : 10,
    icon: getWeatherIcon(response.current_weather.weathercode),
    time: response.current_weather.time,
  };

  // Transform forecast data
  const forecast: ForecastDay[] = response.daily.time.map((date, index) => ({
    date,
    dayOfWeek: getDayOfWeek(date),
    temperatureMax: Math.round(response.daily.temperature_2m_max[index]),
    temperatureMin: Math.round(response.daily.temperature_2m_min[index]),
    condition: getWeatherCondition(response.daily.weathercode[index]),
    weatherCode: response.daily.weathercode[index],
    icon: getWeatherIcon(response.daily.weathercode[index]),
    precipitationSum: response.daily.precipitation_sum?.[index] ?? 0,
    precipitationProbability: response.daily.precipitation_probability_max?.[index] ?? 0,
    windSpeedMax: response.daily.windspeed_10m_max?.[index] ?? 0,
    uvIndexMax: response.daily.uv_index_max?.[index] ?? 0,
  }));

  // Build location info
  const weatherLocation: WeatherLocation = {
    name: location.city || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`,
    country: location.country,
    latitude: response.latitude,
    longitude: response.longitude,
    timezone: response.timezone,
  };

  // Return transformed data
  return {
    current,
    forecast,
    location: weatherLocation,
    timestamp: Date.now(),
    source: 'api',
  };
}

// Main function to get weather data with transformation
export async function getWeatherData(
  location: Location,
  options?: WeatherFetchOptions
): Promise<WeatherData> {
  const response = await fetchWeatherData(
    location.latitude,
    location.longitude,
    options
  );
  
  return transformWeatherResponse(response, location);
}

// Weather service API
export const weatherService = {
  getWeatherData,
  fetchWeatherData,
  transformWeatherResponse,
  getWeatherCondition,
  getWeatherIcon,
} as const;
