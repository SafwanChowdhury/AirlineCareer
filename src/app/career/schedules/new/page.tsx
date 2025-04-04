"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePilot } from "@/lib/contexts/pilot-context";

type FormData = {
  name: string;
  startLocation: string | null;
  durationDays: number;
  preferences: {
    shortHaul: number;
    mediumHaul: number;
    longHaul: number;
  };
};

export default function NewSchedulePage() {
  const router = useRouter();
  const { pilotId } = usePilot();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    startLocation: null,
    durationDays: 1,
    preferences: {
      shortHaul: 33,
      mediumHaul: 33,
      longHaul: 34,
    },
  });

  if (!pilotId) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No pilot profile selected. Please create or select a pilot profile
              to continue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/career/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pilotId: pilotId.toString(),
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create schedule");
      }

      toast.success("Schedule created successfully");
      router.push("/career");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const updatePreferences = (
    type: "shortHaul" | "mediumHaul" | "longHaul",
    value: number
  ) => {
    const remaining = 100 - value;
    let newPreferences;

    switch (type) {
      case "shortHaul":
        newPreferences = {
          shortHaul: value,
          mediumHaul: Math.floor(remaining / 2),
          longHaul: Math.ceil(remaining / 2),
        };
        break;
      case "mediumHaul":
        newPreferences = {
          shortHaul: Math.floor(remaining / 2),
          mediumHaul: value,
          longHaul: Math.ceil(remaining / 2),
        };
        break;
      case "longHaul":
        newPreferences = {
          shortHaul: Math.floor(remaining / 2),
          mediumHaul: Math.ceil(remaining / 2),
          longHaul: value,
        };
        break;
    }

    setFormData((prev) => ({
      ...prev,
      preferences: newPreferences,
    }));
  };

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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter schedule name"
                required
              />
            </div>

            <div>
              <Label htmlFor="startLocation">
                Override Start Location (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="startLocation"
                  value={formData.startLocation || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      startLocation: e.target.value
                        ? e.target.value.toUpperCase()
                        : null,
                    }))
                  }
                  placeholder="Use current location"
                  maxLength={3}
                />
                {formData.startLocation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, startLocation: null }))
                    }
                  >
                    Reset
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty to use your current location
              </p>
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

            <div className="space-y-4">
              <Label>Flight Type Preferences</Label>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Short Haul (&lt; 3 hours)</span>
                    <span>{formData.preferences.shortHaul}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.preferences.shortHaul}
                    onChange={(e) =>
                      updatePreferences("shortHaul", parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Medium Haul (3-6 hours)</span>
                    <span>{formData.preferences.mediumHaul}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.preferences.mediumHaul}
                    onChange={(e) =>
                      updatePreferences("mediumHaul", parseInt(e.target.value))
                    }
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span>Long Haul (&gt; 6 hours)</span>
                    <span>{formData.preferences.longHaul}%</span>
                  </div>
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.preferences.longHaul}
                    onChange={(e) =>
                      updatePreferences("longHaul", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
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
