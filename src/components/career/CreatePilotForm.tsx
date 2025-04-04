"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePilot } from "@/lib/contexts/pilot-context";

interface FormData {
  name: string;
  homeBase: string;
  preferredAirline: string;
}

const initialFormData: FormData = {
  name: "",
  homeBase: "",
  preferredAirline: "",
};

export function CreatePilotForm() {
  const { setPilotId } = usePilot();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/career/pilots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create pilot");
      }

      const newPilot = await response.json();
      setPilotId(newPilot.id);
      toast.success("Pilot profile created successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Pilot Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Pilot Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter pilot name"
              required
            />
          </div>

          <div>
            <Label htmlFor="homeBase">Home Base (IATA Code)</Label>
            <Input
              id="homeBase"
              value={formData.homeBase}
              onChange={(e) =>
                handleChange("homeBase", e.target.value.toUpperCase())
              }
              placeholder="e.g. LAX"
              maxLength={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="preferredAirline">
              Preferred Airline (Optional)
            </Label>
            <Input
              id="preferredAirline"
              value={formData.preferredAirline}
              onChange={(e) => handleChange("preferredAirline", e.target.value)}
              placeholder="Enter airline name"
            />
          </div>

          <Button type="submit">Create Pilot</Button>
        </form>
      </CardContent>
    </Card>
  );
}
