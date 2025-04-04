"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PilotProfile } from "@/lib/types";
import { usePilot } from "@/lib/contexts/pilot-context";

interface FormData {
  name: string;
  homeBase: string;
  currentLocation: string;
  preferredAirline: string;
}

export default function PilotProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { pilotId, setPilotId } = usePilot();
  const [pilot, setPilot] = useState<PilotProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/career/pilots/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPilot(data);
          setFormData({
            name: data.name,
            homeBase: data.homeBase,
            currentLocation: data.currentLocation,
            preferredAirline: data.preferredAirline || "",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching pilot:", error);
        toast.error("Failed to load pilot profile");
      })
      .finally(() => setIsLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const response = await fetch(`/api/career/pilots/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update pilot profile");
      }

      const updatedPilot = await response.json();
      setPilot(updatedPilot);
      setIsEditing(false);
      toast.success("Pilot profile updated successfully");
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
      const response = await fetch(`/api/career/pilots/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete pilot profile");
      }

      if (pilotId === parseInt(params.id, 10)) {
        setPilotId(0);
      }

      toast.success("Pilot profile deleted successfully");
      router.push("/career");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    if (!formData) return;
    setFormData((prev) => ({ ...prev!, [field]: value }));
  };

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

  if (!pilot || !formData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Pilot profile not found
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
          <CardTitle>{isEditing ? "Edit Profile" : pilot.name}</CardTitle>
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
                  <AlertDialogTitle>Delete Pilot Profile</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this pilot profile? This
                    action cannot be undone.
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
                <Label htmlFor="currentLocation">
                  Current Location (IATA Code)
                </Label>
                <Input
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) =>
                    handleChange(
                      "currentLocation",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g. JFK"
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
                  onChange={(e) =>
                    handleChange("preferredAirline", e.target.value)
                  }
                  placeholder="Enter airline name"
                />
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
                <Label>Home Base</Label>
                <p className="text-lg">{pilot.homeBase}</p>
              </div>
              <div>
                <Label>Current Location</Label>
                <p className="text-lg">{pilot.currentLocation}</p>
              </div>
              {pilot.preferredAirline && (
                <div>
                  <Label>Preferred Airline</Label>
                  <p className="text-lg">{pilot.preferredAirline}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
