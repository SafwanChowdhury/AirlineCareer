// src/components/duration-slider.tsx
import { useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useMaxDuration } from "@/lib/hooks/use-airport-data";
import { Skeleton } from "@/components/ui/skeleton";

interface DurationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function DurationSlider({ value, onChange }: DurationSliderProps) {
  // Get max duration from our hook
  const { data, isLoading, error } = useMaxDuration();
  const maxDuration = data?.maxDuration || 1000;

  // Initialize slider to max value if not already set
  useEffect(() => {
    if (!isLoading && data && value === 0) {
      onChange(data.maxDuration);
    }
  }, [isLoading, data, value, onChange]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Max Flight Duration</Label>
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>Max Flight Duration</Label>
          <span>Error loading durations</span>
        </div>
        <Slider disabled={true} value={[0]} min={0} max={100} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>Max Flight Duration: {formatDuration(value)}</Label>
      </div>
      <Slider
        value={[value]}
        min={30}
        max={maxDuration}
        step={15}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}
