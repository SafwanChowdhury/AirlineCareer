"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Plane,
  Timer,
  Globe2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

interface RoutesResponse {
  data: RouteResult[];
  pagination: PaginationInfo;
}

export default function RoutesPage() {
  const [filters, setFilters] = useState({
    airline: "",
    departure: "",
    arrival: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [routesData, setRoutesData] = useState<RoutesResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const clearFilters = () => {
    setFilters({
      airline: "",
      departure: "",
      arrival: "",
      country: "",
    });
    setRoutesData(null);
    setCurrentPage(1);
  };

  const searchRoutes = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");

      const response = await fetch(`/api/routes?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        console.log("Routes data received:", data);
        setRoutesData(data);
        setCurrentPage(page);
        if (data.data.length === 0) {
          toast.info("No routes found matching your criteria");
        }
      } else {
        console.error("API error:", data);
        throw new Error(data.error || "Failed to fetch routes");
      }
    } catch (error) {
      console.error("Error searching routes:", error);
      toast.error(
        "Failed to search routes: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      (!routesData?.pagination.totalPages ||
        newPage <= routesData.pagination.totalPages)
    ) {
      searchRoutes(newPage);
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
            <Button
              size="sm"
              onClick={() => searchRoutes(1)}
              disabled={isLoading}
            >
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
          {!routesData ? (
            <div className="text-muted-foreground text-center py-8">
              Use the search filters above to find routes
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {routesData.data.map((route) => (
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

              {/* Pagination Controls */}
              {routesData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {routesData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={
                      currentPage === routesData.pagination.totalPages ||
                      isLoading
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
