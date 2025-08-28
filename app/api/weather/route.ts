import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { weatherService } from '@/lib/weather';
import { weatherCache } from '@/lib/cache';
import type { Location } from '@/lib/location';

// Query parameters schema
const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  city: z.string().optional(),
  country: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse({
      lat: searchParams.get('lat'),
      lon: searchParams.get('lon'),
      city: searchParams.get('city'),
      country: searchParams.get('country'),
    });

    // Create location object
    const location: Location = {
      latitude: query.lat,
      longitude: query.lon,
      city: query.city || undefined,
      country: query.country || undefined,
      source: 'manual',
    };

    // Check cache first
    const cachedData = weatherCache.get(location);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // Fetch fresh weather data
    const weatherData = await weatherService.getWeatherData(location);
    
    // Cache the data
    weatherCache.set(location, weatherData);

    return NextResponse.json({
      success: true,
      data: weatherData,
      cached: false,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle weather service errors
    if (error && typeof error === 'object' && 'type' in error) {
      const weatherError = error as any;
      return NextResponse.json(
        {
          success: false,
          error: weatherError.message || 'Failed to fetch weather data',
          type: weatherError.type,
        },
        { status: 503 }
      );
    }

    // Generic error handling
    console.error('Weather API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

