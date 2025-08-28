import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CurrentWeatherSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Skeleton */}
        <div className="text-center border-b pb-4">
          <Skeleton className="h-6 w-32 mx-auto mb-1" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        
        <div className="space-y-2">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-14" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ForecastCardSkeleton() {
  return (
    <Card className="min-w-[140px]">
      <CardContent className="p-4 text-center">
        <div className="space-y-2">
          <Skeleton className="h-5 w-16 mx-auto" />
          <Skeleton className="h-10 w-10 rounded-full mx-auto my-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
          <div className="flex justify-center items-center gap-2">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeatherDisplaySkeleton() {
  return (
    <div className="space-y-8">
      <CurrentWeatherSkeleton />
      
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ForecastCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

