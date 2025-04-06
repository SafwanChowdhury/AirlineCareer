import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, Calendar } from "lucide-react";
import { ScheduledFlightWithRoute } from "@/lib/types";

interface FlightCardProps {
  flight: ScheduledFlightWithRoute;
  onStatusChange?: (
    status: "scheduled" | "in_progress" | "completed" | "cancelled"
  ) => void;
  showActions?: boolean;
}

export function FlightCard({
  flight,
  onStatusChange,
  showActions = true,
}: FlightCardProps) {
  const departureTime = new Date(flight.departureTime || "");
  const arrivalTime = new Date(flight.arrivalTime || "");
  const duration = flight.duration_min || 0;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  // Default the status to scheduled if somehow null/undefined
  const status = flight.status || "scheduled";

  const statusVariants: Record<
    "scheduled" | "in_progress" | "completed" | "cancelled",
    "default" | "secondary" | "outline" | "destructive"
  > = {
    scheduled: "secondary",
    in_progress: "outline",
    completed: "default",
    cancelled: "destructive",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {flight.airline_name || "Unknown"} {flight.airline_iata || ""}
          </CardTitle>
          <Badge
            variant={statusVariants[status as keyof typeof statusVariants]}
          >
            {status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">From</div>
            <div className="font-medium">
              {flight.departure_city || "Unknown"}
            </div>
            <div className="text-sm">{flight.departure_iata || ""}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">To</div>
            <div className="font-medium">
              {flight.arrival_city || "Unknown"}
            </div>
            <div className="text-sm">{flight.arrival_iata || ""}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {format(departureTime, "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {format(departureTime, "HH:mm")} - {format(arrivalTime, "HH:mm")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            <span className="text-sm">
              {hours}h {minutes}m
            </span>
          </div>
        </div>

        {showActions &&
          onStatusChange &&
          status !== "completed" &&
          status !== "cancelled" && (
            <div className="mt-4 space-x-2">
              {status === "scheduled" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onStatusChange("in_progress")}
                >
                  Start Flight
                </Button>
              )}
              {status === "in_progress" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onStatusChange("completed")}
                >
                  Complete Flight
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onStatusChange("cancelled")}
              >
                Cancel Flight
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
