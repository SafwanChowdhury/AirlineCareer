"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePilot } from "@/lib/contexts/pilot-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, Calendar, Clock, Settings } from "lucide-react";
import { toast } from "sonner";

interface PilotStats {
  totalFlights: number;
  totalDistance: number;
  totalHours: number;
  favoriteAirline: string;
  mostVisitedAirport: string;
}

export default function ProfilePage() {
  const { pilotId } = usePilot();
  const router = useRouter();
  const [pilot, setPilot] = useState<any>(null);
  const [stats, setStats] = useState<PilotStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!pilotId) {
      router.push("/career/pilots/new");
      return;
    }

    const fetchPilotData = async () => {
      try {
        const [pilotResponse, statsResponse] = await Promise.all([
          fetch(`/api/career/pilots/${pilotId}`),
          fetch(`/api/career/pilots/${pilotId}/stats`),
        ]);

        if (!pilotResponse.ok) {
          throw new Error("Failed to fetch pilot data");
        }

        const pilotData = await pilotResponse.json();
        setPilot(pilotData);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Error fetching pilot data:", error);
        toast.error("Failed to load pilot profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPilotData();
  }, [pilotId, router]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pilot) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{pilot.name}'s Profile</h1>
        <Button
          variant="outline"
          onClick={() => router.push(`/career/pilots/${pilotId}/edit`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pilot Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Home Base:</span>
              <span>{pilot.homeBase}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="font-medium">Current Location:</span>
              <span>{pilot.currentLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Preferred Airline:</span>
              <span>{pilot.preferredAirline || "No preference"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Joined:</span>
              <span>{new Date(pilot.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flight Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats ? (
              <>
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Total Flights:</span>
                  <span>{stats.totalFlights}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Total Distance:</span>
                  <span>{stats.totalDistance.toLocaleString()} km</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Flight Hours:</span>
                  <span>{stats.totalHours.toLocaleString()} hours</span>
                </div>
                {stats.favoriteAirline && (
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Most Flown Airline:</span>
                    <span>{stats.favoriteAirline}</span>
                  </div>
                )}
                {stats.mostVisitedAirport && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Most Visited Airport:</span>
                    <span>{stats.mostVisitedAirport}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground text-center py-4">
                No flight statistics available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
