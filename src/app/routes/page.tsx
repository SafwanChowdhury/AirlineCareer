"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plane, Timer, Globe2 } from "lucide-react";
import { toast } from "sonner";

interface RouteResult {
  route_id: number;
  departure_iata: string;
  departure_city: string;
  departure_country: string;
  arrival_iata: string;
  arrival_city: string;
  arrival_country: string;
  distance_km: number;
  duration_min: number;
  airline_iata: string;
  airline_name: string;
}

export default function RoutesPage() {
  const [filters, setFilters] = useState({
    airline: "",
    departure: "",
    arrival: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteResult[]>([]);

  const clearFilters = () => {
    setFilters({
      airline: "",
      departure: "",
      arrival: "",
      country: "",
    });
    setRoutes([]);
  };

  const searchRoutes = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/routes?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setRoutes(data);
        if (data.length === 0) {
          toast.info("No routes found matching your criteria");
        }
      } else {
        throw new Error(data.error || "Failed to fetch routes");
      }
    } catch (error) {
      console.error("Error searching routes:", error);
      toast.error("Failed to search routes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Route Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="airline">Airline</Label>
              <Input
                id="airline"
                placeholder="Search by airline..."
                value={filters.airline}
                onChange={(e) =>
                  setFilters({ ...filters, airline: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure">Departure</Label>
              <Input
                id="departure"
                placeholder="IATA code or city..."
                value={filters.departure}
                onChange={(e) =>
                  setFilters({ ...filters, departure: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrival">Arrival</Label>
              <Input
                id="arrival"
                placeholder="IATA code or city..."
                value={filters.arrival}
                onChange={(e) =>
                  setFilters({ ...filters, arrival: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Filter by country..."
                value={filters.country}
                onChange={(e) =>
                  setFilters({ ...filters, country: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Button size="sm" onClick={searchRoutes} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? "Searching..." : "Search Routes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              Use the search filters above to find routes
            </div>
          ) : (
            <div className="space-y-4">
              {routes.map((route) => (
                <div
                  key={route.route_id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Plane className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {route.airline_name}
                        </span>
                        <span className="text-muted-foreground">
                          ({route.airline_iata})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <span className="font-medium">
                            {route.departure_iata}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            {route.departure_city}
                          </span>
                        </div>
                        <span>→</span>
                        <div>
                          <span className="font-medium">
                            {route.arrival_iata}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            {route.arrival_city}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Globe2 className="h-4 w-4 mr-1" />
                        {route.distance_km}km
                      </div>
                      <div className="flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        {Math.round(route.duration_min / 60)}h{" "}
                        {route.duration_min % 60}m
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
