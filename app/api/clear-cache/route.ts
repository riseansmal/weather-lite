import { NextResponse } from 'next/server';
import { weatherCache } from '@/lib/cache';
import { clearLocationCache } from '@/lib/location';

export async function POST() {
  try {
    // Clear weather data cache
    weatherCache.clear();
    
    // Clear location cache
    clearLocationCache();
    
    console.log('Server caches cleared successfully');
    
    return NextResponse.json({
      success: true,
      message: 'All server caches cleared successfully',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error clearing server caches:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear server caches',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
