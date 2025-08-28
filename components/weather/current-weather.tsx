'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { CurrentWeather as CurrentWeatherType, WeatherLocation } from '@/lib/weather';
import { config } from '@/lib/env';

interface CurrentWeatherProps {
  data: CurrentWeatherType;
  location: WeatherLocation;
  source?: 'cache' | 'api' | 'default';
  timestamp?: number;
}

export function CurrentWeather({ data, location, source, timestamp }: CurrentWeatherProps) {
  const tempUnit = config.units.temperature === 'fahrenheit' ? 'F' : 'C';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{data.condition}</h2>
          <span className="text-4xl" role="img" aria-label={data.condition}>
            {data.icon}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location - Only show if location.name exists */}
        {location.name && (
          <div className="text-center border-b pb-4">
            <h3 className="text-xl font-semibold">
              {location.name}
            </h3>
            {location.country && (
              <p className="text-sm text-muted-foreground">
                {location.country}
              </p>
            )}
            {source === 'cache' && timestamp && (
              <p className="text-xs text-muted-foreground mt-1">
                Cached • {new Date(timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-6xl font-bold tabular-nums">
            {data.temperature}°{tempUnit}
          </div>
          <div className="text-lg text-muted-foreground">
            Feels like {data.feelsLike}°{tempUnit}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Humidity</p>
            <p className="font-medium">{data.humidity}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Wind Speed</p>
            <p className="font-medium">{data.windSpeed} km/h</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">UV Index</p>
            <p className="font-medium">{data.uvIndex}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Visibility</p>
            <p className="font-medium">{data.visibility} km</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

