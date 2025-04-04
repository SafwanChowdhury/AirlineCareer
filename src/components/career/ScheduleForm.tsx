import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AirportSelect } from "./AirportSelect";
import { AirlineSelect } from "./AirlineSelect";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { usePilot } from "@/lib/contexts/PilotContext";
import { createSchedule } from "@/lib/hooks/use-schedule-data";

interface FormData {
  name: string;
  startLocation: string;
  endLocation: string;
  durationDays: number;
  haulPreferences: "short" | "medium" | "long" | "any";
  preferredAirline?: string;
  maxLayoverHours: number;
}

const initialFormData: FormData = {
  name: "",
  startLocation: "",
  endLocation: "",
  durationDays: 1,
  haulPreferences: "any",
  maxLayoverHours: 4,
};

export function ScheduleForm() {
  const router = useRouter();
  const { pilot } = usePilot();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilot) return;

    try {
      setIsSubmitting(true);
      await createSchedule({
        ...formData,
        pilotId: pilot.id,
      });

      toast.success("Schedule created successfully");
      router.push("/career");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create schedule"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="startLocation">Start Location</Label>
              <AirportSelect
                value={formData.startLocation}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, startLocation: value }))
                }
                placeholder="Select departure airport"
              />
            </div>

            <div>
              <Label htmlFor="endLocation">End Location</Label>
              <AirportSelect
                value={formData.endLocation}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, endLocation: value }))
                }
                placeholder="Select arrival airport"
                excludeAirports={[formData.startLocation]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="durationDays">Duration (Days)</Label>
            <Input
              id="durationDays"
              type="number"
              min={1}
              max={30}
              value={formData.durationDays}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  durationDays: parseInt(e.target.value, 10),
                }))
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="haulPreferences">Flight Length Preference</Label>
            <Select
              value={formData.haulPreferences}
              onValueChange={(value: "short" | "medium" | "long" | "any") =>
                setFormData((prev) => ({ ...prev, haulPreferences: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flight length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Length</SelectItem>
                <SelectItem value="short">Short Haul (&lt;3 hours)</SelectItem>
                <SelectItem value="medium">Medium Haul (3-6 hours)</SelectItem>
                <SelectItem value="long">Long Haul (&gt;6 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferredAirline">
              Preferred Airline (Optional)
            </Label>
            <AirlineSelect
              value={formData.preferredAirline || ""}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, preferredAirline: value }))
              }
              placeholder="Select preferred airline"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <Label htmlFor="maxLayoverHours">Maximum Layover Time</Label>
              <span className="text-sm text-muted-foreground">
                {formData.maxLayoverHours} hours
              </span>
            </div>
            <Slider
              id="maxLayoverHours"
              min={1}
              max={12}
              step={1}
              value={[formData.maxLayoverHours]}
              onValueChange={([value]) =>
                setFormData((prev) => ({ ...prev, maxLayoverHours: value }))
              }
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <LoadingSpinner className="mr-2" /> : null}
            Generate Schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
