"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightCard } from "@/components/career/FlightCard";
import { Plane, MapPin, Building2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  usePilotProfile,
  usePilotStats,
  useScheduledFlights,
  updateFlightStatus,
} from "@/lib/hooks/use-pilot";
import { toast } from "sonner";
import { ScheduledFlightWithRoute } from "@/lib/types";
import Link from "next/link";
import { usePilot } from "@/lib/contexts/pilot-context";

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

  const { pilot, isLoading: isLoadingPilot } = usePilotProfile(pilotId || 0);
  const { stats, isLoading: isLoadingStats } = usePilotStats(pilotId || 0);
  const { flights, isLoading: isLoadingFlights } = useScheduledFlights(
    pilotId || 0
  );

  const handleStatusChange = async (
    flightId: number,
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
  ) => {
    try {
      await updateFlightStatus(flightId, status);
      toast.success("Flight Updated", {
        description: `Status changed to ${status.replace("_", " ")}`,
      });
    } catch {
      toast.error("Error", {
        description: "Failed to update flight status",
      });
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6">
        {/* Pilot Profile */}
        {isLoadingPilot ? (
          <LoadingCard />
        ) : pilot ? (
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
                      {pilot.home_base}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Current Location</div>
                    <div className="text-sm text-muted-foreground">
                      {pilot.current_location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Preferred Airline</div>
                    <div className="text-sm text-muted-foreground">
                      {pilot.preferred_airline || "No preference"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Flight History Stats */}
        {isLoadingStats ? (
          <LoadingCard />
        ) : stats ? (
          <Card>
            <CardHeader>
              <CardTitle>Career Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <div className="text-2xl font-bold">
                    {stats.total_flights}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Flights
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor(stats.total_minutes / 60)}h{" "}
                    {stats.total_minutes % 60}m
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Flight Time
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.airports_visited}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Airports Visited
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {stats.airlines_flown}
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
            <Button asChild>
              <Link href="/career/schedules/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoadingFlights ? (
              <>
                <LoadingFlightCard />
                <LoadingFlightCard />
                <LoadingFlightCard />
              </>
            ) : flights.length > 0 ? (
              flights.map((flight: ScheduledFlightWithRoute) => (
                <FlightCard
                  key={flight.scheduled_flight_id}
                  flight={flight}
                  onStatusChange={(status) =>
                    handleStatusChange(flight.scheduled_flight_id, status)
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
