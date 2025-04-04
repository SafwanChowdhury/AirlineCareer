// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AirlineSelect } from "@/components/airline-select";
import { AirportSelect } from "@/components/airport-select";
import { CountrySelect } from "@/components/country-select";
import { DurationSlider } from "@/components/duration-slider";
import { RouteTable } from "@/components/route-table";
import { RouteFilters, RoutesResponse } from "@/types";
import { RefreshCw, Search } from "lucide-react";

export default function Home() {
  // State for filters
  const [filters, setFilters] = useState<RouteFilters>({
    airline: "",
    departure: "",
    arrival: "",
    country: "",
    maxDuration: 0,
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for routes data
  const [routesData, setRoutesData] = useState<RoutesResponse | null>(null);

  // State for loading
  const [loading, setLoading] = useState(false);

  // Function to fetch routes
  const fetchRoutes = async (page: number = 1) => {
    setLoading(true);

    try {
      // Build query string from filters
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");

      if (filters.airline) params.append("airline", filters.airline);
      if (filters.departure) params.append("departure", filters.departure);
      if (filters.arrival) params.append("arrival", filters.arrival);
      if (filters.country) params.append("country", filters.country);
      if (filters.maxDuration)
        params.append("maxDuration", filters.maxDuration.toString());

      const response = await fetch(`/api/routes?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setRoutesData(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRoutes(1);
  };

  // Handle reset filters
  const handleReset = () => {
    setFilters({
      airline: "",
      departure: "",
      arrival: "",
      country: "",
      maxDuration: 0,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchRoutes(page);
  };

  // Fetch routes on first load
  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Airline Routes Database</CardTitle>
          <CardDescription>
            Browse and filter airline routes data
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="departure">Departure Airport</Label>
              <AirportSelect
                value={filters.departure || ""}
                onChange={(value) =>
                  setFilters({ ...filters, departure: value })
                }
                placeholder="Select departure..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">Arrival Airport</Label>
              <AirportSelect
                value={filters.arrival || ""}
                onChange={(value) => setFilters({ ...filters, arrival: value })}
                placeholder="Select arrival..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="airline">Airline</Label>
              <AirlineSelect
                value={filters.airline || ""}
                onChange={(value) => setFilters({ ...filters, airline: value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <CountrySelect
                value={filters.country || ""}
                onChange={(value) => setFilters({ ...filters, country: value })}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <DurationSlider
                value={filters.maxDuration || 0}
                onChange={(value) =>
                  setFilters({ ...filters, maxDuration: value })
                }
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>

          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search Routes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
          <CardDescription>
            {routesData?.pagination.totalCount
              ? `Found ${routesData.pagination.totalCount} routes matching your criteria`
              : "No routes found"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RouteTable
            data={routesData}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
