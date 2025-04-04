// src/components/duration-slider.tsx
import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface DurationSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function DurationSlider({ value, onChange }: DurationSliderProps) {
  const [maxDuration, setMaxDuration] = useState<number>(1000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaxDuration = async () => {
      try {
        const response = await fetch("/api/airports?type=maxDuration");
        if (!response.ok) throw new Error("Failed to fetch max duration");
        const data = await response.json();
        setMaxDuration(data.maxDuration);
        // Initialize slider to max value
        if (value === 0) {
          onChange(data.maxDuration);
        }
      } catch (error) {
        console.error("Error fetching max duration:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaxDuration();
  }, [onChange, value]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>Max Flight Duration: {formatDuration(value)}</Label>
      </div>
      <Slider
        disabled={loading}
        value={[value]}
        min={30}
        max={maxDuration}
        step={15}
        onValueChange={(vals) => onChange(vals[0])}
      />
    </div>
  );
}
