"use client";

import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { Schedule } from "@/lib/types";
import { usePilot } from "@/lib/contexts/pilot-context";

interface FormData {
  name: string;
  startLocation: string;
  durationDays: number;
  haulPreferences: string;
}

export default function ScheduleDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { pilotId } = usePilot();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pilotId) return;

    fetch(`/api/career/schedules/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSchedule(data);
          setFormData({
            name: data.name,
            startLocation: data.startLocation,
            durationDays: data.durationDays,
            haulPreferences: data.haulPreferences,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
        toast.error("Failed to load schedule");
      })
      .finally(() => setIsLoading(false));
  }, [params.id, pilotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`/api/career/schedules/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update schedule");
      }

      const updatedSchedule = await response.json();
      setSchedule(updatedSchedule);
      setIsEditing(false);
      toast.success("Schedule updated successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/career/schedules/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete schedule");
      }

      toast.success("Schedule deleted successfully");
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
    if (!formData) return;
    setFormData((prev) => ({ ...prev!, [field]: value }));
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-1/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-4 w-2/3 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!schedule || !formData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Schedule not found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Schedule" : schedule.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this schedule? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
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
                <Label htmlFor="startLocation">
                  Start Location (IATA Code)
                </Label>
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
                <Label htmlFor="haulPreferences">
                  Flight Length Preference
                </Label>
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
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Start Location</Label>
                <p className="text-lg">{schedule.startLocation}</p>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="text-lg">{schedule.durationDays} days</p>
              </div>
              <div>
                <Label>Flight Length Preference</Label>
                <p className="text-lg capitalize">
                  {schedule.haulPreferences.replace("_", " ")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
