import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlightPreferencesProps {
  onPreferencesChange?: (preferences: {
    haulType: string;
    preferredAirline?: string;
  }) => void;
}

export function FlightPreferences({
  onPreferencesChange,
}: FlightPreferencesProps) {
  const [haulType, setHaulType] = useState<string>("any");

  const handleHaulTypeChange = (value: string) => {
    setHaulType(value);
    onPreferencesChange?.({ haulType: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flight Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="haulType">Preferred Haul Type</Label>
          <Select value={haulType} onValueChange={handleHaulTypeChange}>
            <SelectTrigger id="haulType">
              <SelectValue placeholder="Select haul type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Distance</SelectItem>
              <SelectItem value="short">Short Haul</SelectItem>
              <SelectItem value="medium">Medium Haul</SelectItem>
              <SelectItem value="long">Long Haul</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
