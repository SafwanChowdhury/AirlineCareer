"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightCard } from "@/components/career/FlightCard";
import { Plane, MapPin, Building2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScheduledFlightWithRoute } from "@/lib/types";
import Link from "next/link";
import { usePilot } from "@/lib/contexts/pilot-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingFlightCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-12 mt-1" />
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-12 mt-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CareerPage() {
  const { pilotId } = usePilot();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pilot, setPilot] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [flights, setFlights] = useState<ScheduledFlightWithRoute[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data function
  const fetchData = async () => {
    if (!pilotId) return;

    setIsRefreshing(true);
    try {
      // Fetch pilot data
      const pilotRes = await fetch(`/api/career/pilots/${pilotId}`);
      if (!pilotRes.ok) throw new Error("Failed to fetch pilot data");
      const pilotData = await pilotRes.json();
      setPilot(pilotData);

      // Fetch stats
      const statsRes = await fetch(`/api/career/pilots/${pilotId}/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch flights
      const flightsRes = await fetch(
        `/api/career/pilots/${pilotId}/scheduled-flights`
      );
      if (flightsRes.ok) {
        const flightsData = await flightsRes.json();
        setFlights(flightsData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchData();
  });

  const handleStatusChange = async (
    flightId: number,
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
  ) => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/career/flights/${flightId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update flight status");
      }

      toast.success(`Flight ${status.replace("_", " ")}`, {
        description: `Status successfully updated`,
      });

      // Refresh data after status change
      await fetchData();
    } catch (error) {
      console.error("Error updating flight status:", error);
      toast.error("Failed to update flight status");
    } finally {
      setIsRefreshing(false);
    }
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
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href="/career/pilots/new">Create Pilot Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6">
          <LoadingCard />
          <LoadingCard />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LoadingFlightCard />
            <LoadingFlightCard />
            <LoadingFlightCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        {/* Pilot Profile */}
        {pilot ? (
          <Card>
            <CardHeader>
              <CardTitle>Pilot Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Home Base</div>
                    <div className="text-sm text-muted-foreground">
                      {pilot.homeBase}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Current Location</div>
                    <div className="text-sm text-muted-foreground">
                      {pilot.currentLocation}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Preferred Airline</div>
                    <div className="text-sm text-muted-foreground">
                      {pilot.preferredAirline || "No preference"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/career/pilots/${pilotId}`}>View Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Flight History Stats */}
        {stats ? (
          <Card>
            <CardHeader>
              <CardTitle>Career Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-2xl font-bold">{stats.totalFlights}</div>
                  <div className="text-sm text-muted-foreground">
                    Total Flights
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor(stats.totalMinutes / 60)}h{" "}
                    {stats.totalMinutes % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Flight Time
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.airportsVisited}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Airports Visited
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.airlinesFlown}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Airlines Flown
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Scheduled Flights */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Scheduled Flights</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button asChild>
                <Link href="/career/schedules/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Schedule
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flights.length > 0 ? (
              flights.map((flight: ScheduledFlightWithRoute) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onStatusChange={(status) =>
                    handleStatusChange(flight.id, status)
                  }
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No scheduled flights. Create a new schedule to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
