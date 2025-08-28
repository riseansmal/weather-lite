'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ForecastDay } from '@/lib/weather';

interface ForecastCardProps {
  day: ForecastDay;
}

export function ForecastCard({ day }: ForecastCardProps) {
  // Format day name - if it's today, show "Today"
  const today = new Date().toDateString();
  const forecastDate = new Date(day.date).toDateString();
  const displayDay = today === forecastDate ? 'Today' : day.dayOfWeek;

  return (
    <Card className="min-w-[140px] hover:shadow-lg transition-shadow">
      <CardContent className="p-4 text-center">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">{displayDay}</h3>
          <div className="text-4xl my-2" role="img" aria-label={day.condition}>
            {day.icon}
          </div>
          <p className="text-xs text-muted-foreground">{day.condition}</p>
          <div className="flex justify-center items-center gap-2 text-sm">
            <span className="font-semibold">
              {day.temperatureMax}°
            </span>
            <span className="text-muted-foreground">
              {day.temperatureMin}°
            </span>
          </div>
          {day.precipitationProbability > 0 && (
            <div className="text-xs text-muted-foreground">
              💧 {day.precipitationProbability}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

