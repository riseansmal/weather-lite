import { CurrentWeather } from './current-weather';
import { ForecastCard } from './forecast-card';
import { WeatherDisplaySkeleton } from './weather-skeleton';
import type { WeatherData } from '@/lib/weather';

interface WeatherDisplayProps {
  data: WeatherData | null;
  loading?: boolean;
  error?: Error | null;
}

export function WeatherDisplay({ data, loading, error }: WeatherDisplayProps) {
  // Show skeleton while loading
  if (loading) {
    return <WeatherDisplaySkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive text-lg font-medium">
          Unable to load weather data
        </p>
        <p className="text-muted-foreground mt-2">
          {error.message || 'Please try again later'}
        </p>
      </div>
    );
  }

  // Show empty state if no data
  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No weather data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Current Weather */}
      <CurrentWeather 
        data={data.current} 
        location={data.location}
        source={data.source}
        timestamp={data.timestamp}
      />

      {/* 5-Day Forecast */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">5-Day Forecast</h2>
        
        {/* Mobile: Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-2 md:hidden snap-x snap-mandatory">
          {data.forecast.map((day, index) => (
            <div key={index} className="snap-center">
              <ForecastCard day={day} />
            </div>
          ))}
        </div>

        {/* Tablet and Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.forecast.map((day, index) => (
            <ForecastCard key={index} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}

