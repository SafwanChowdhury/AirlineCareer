"use client";

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
import { usePilot } from "@/lib/contexts/pilot-context";

interface FormData {
  name: string;
  startLocation: string;
  endLocation: string;
  durationDays: number;
  haulPreferences: string;
}

const initialFormData: FormData = {
  name: "",
  startLocation: "",
  endLocation: "",
  durationDays: 1,
  haulPreferences: "any",
};

export default function NewSchedulePage() {
  const router = useRouter();
  const { pilotId } = usePilot();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pilotId) {
      toast.error("No pilot selected");
      return;
    }

    try {
      const response = await fetch("/api/career/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          pilotId: pilotId.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create schedule");
      }

      toast.success("Schedule created successfully");
      router.push("/career");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!pilotId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No pilot profile selected. Please create or select a pilot profile
              to continue.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter schedule name"
                required
              />
            </div>

            <div>
              <Label htmlFor="startLocation">Start Location (IATA Code)</Label>
              <Input
                id="startLocation"
                value={formData.startLocation}
                onChange={(e) =>
                  handleChange("startLocation", e.target.value.toUpperCase())
                }
                placeholder="e.g. LAX"
                maxLength={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="endLocation">End Location (IATA Code)</Label>
              <Input
                id="endLocation"
                value={formData.endLocation}
                onChange={(e) =>
                  handleChange("endLocation", e.target.value.toUpperCase())
                }
                placeholder="e.g. JFK"
                maxLength={3}
                required
              />
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
                  handleChange("durationDays", parseInt(e.target.value, 10))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="haulPreferences">Flight Length Preference</Label>
              <Select
                value={formData.haulPreferences}
                onValueChange={(value) =>
                  handleChange("haulPreferences", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select flight length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="short">Short Haul</SelectItem>
                  <SelectItem value="medium">Medium Haul</SelectItem>
                  <SelectItem value="long">Long Haul</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit">Create Schedule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
