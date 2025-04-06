"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePilot } from "@/lib/contexts/pilot-context";
import { createPilot } from "@/lib/hooks/use-pilot";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newPilot = await createPilot(formData);
      setPilotId(newPilot.id);
      toast.success("Pilot profile created successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Pilot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
