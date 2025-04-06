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
import { usePilot } from "@/lib/contexts/pilot-context";
import { createSchedule } from "@/lib/hooks/use-schedule";

interface FormData {
  name: string;
  startLocation: string;
  durationDays: number;
  haulPreferences: "short" | "medium" | "long" | "any";
  preferredAirline?: string;
  maxLayoverHours: number;
}

interface FormErrors {
  name?: string;
  startLocation?: string;
  durationDays?: string;
}

const initialFormData: FormData = {
  name: "",
  startLocation: "",
  durationDays: 1,
  haulPreferences: "any",
  maxLayoverHours: 4,
};

export function ScheduleForm() {
  const router = useRouter();
  const { pilotId } = usePilot();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate the form data
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Schedule name is required";
      isValid = false;
    }

    if (!formData.startLocation) {
      errors.startLocation = "Start location is required";
      isValid = false;
    }

    if (formData.durationDays < 1 || formData.durationDays > 30) {
      errors.durationDays = "Duration must be between 1 and 30 days";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pilotId) {
      console.error("[schedule-form] No pilot ID available");
      toast.error("Please select a pilot before creating a schedule");
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      console.log("[schedule-form] Form validation failed:", formErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    console.log("[schedule-form] Submitting schedule with pilotId:", pilotId);

    try {
      setIsSubmitting(true);

      await createSchedule({
        ...formData,
        pilotId: pilotId,
      });

      toast.success("Schedule created successfully");
      router.push("/career");
    } catch (error) {
      console.error("[schedule-form] Error creating schedule:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create schedule"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pilotId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="mb-4">
              Please select a pilot first to create a schedule.
            </p>
            <Button onClick={() => router.push("/career/pilots")}>
              Go to Pilots
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="name"
              className={formErrors.name ? "text-red-500" : ""}
            >
              Schedule Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={formErrors.name ? "border-red-500" : ""}
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="startLocation"
                className={formErrors.startLocation ? "text-red-500" : ""}
              >
                Start Location
              </Label>
              <AirportSelect
                value={formData.startLocation}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, startLocation: value }))
                }
                placeholder="Select departure airport"
              />
              {formErrors.startLocation && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.startLocation}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label
              htmlFor="durationDays"
              className={formErrors.durationDays ? "text-red-500" : ""}
            >
              Duration (Days)
            </Label>
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
              className={formErrors.durationDays ? "border-red-500" : ""}
              required
            />
            {formErrors.durationDays && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.durationDays}
              </p>
            )}
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
