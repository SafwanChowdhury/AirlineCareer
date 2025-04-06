"use client";

import { useEffect } from "react";
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
import { AirlineSelect } from "@/components/career/AirlineSelect";
import { AirportSelect } from "@/components/airport-select";
import { CountrySelect } from "@/components/country-select";
import { DurationSlider } from "@/components/duration-slider";
import { RouteTable } from "@/components/route-table";
import { RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useRoutesList } from "@/lib/hooks/use-route-data";
import { useForm } from "@/lib/hooks/use-form";
import { RouteFilters } from "@/types";

export default function Home() {
  // Use our new hooks for routes list management with the form hook for filters
  const {
    items: routes,
    isLoading,
    error,
    filters,
    currentPage,
    totalPages,
    goToPage,
  } = useRoutesList({
    autoFetch: true,
    paginationOptions: {
      initialLimit: 10,
    },
    filterOptions: {
      persistToUrl: true,
    },
  });

  // Form for managing filter inputs
  const form = useForm<RouteFilters>({
    initialValues: {
      airline: "",
      departure: "",
      arrival: "",
      country: "",
      maxDuration: 0,
    },
    onSubmit: (values) => {
      // Update filters
      filters.setFilters(values);
    },
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load routes: " + error.message);
    }
  }, [error]);

  // Update form values when filters change
  useEffect(() => {
    form.setValues(filters.filters);
  }, [filters.filters, form]);

  // Handle search button click
  const handleSearch = () => {
    form.handleSubmit();
  };

  // Handle reset filters
  const handleReset = () => {
    form.resetForm();
    filters.clearFilters();
  };

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
                value={form.values.departure || ""}
                onChange={(value) => form.setFieldValue("departure", value)}
                placeholder="Select departure..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival">Arrival Airport</Label>
              <AirportSelect
                value={form.values.arrival || ""}
                onChange={(value) => form.setFieldValue("arrival", value)}
                placeholder="Select arrival..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="airline">Airline</Label>
              <AirlineSelect
                value={form.values.airline || ""}
                onChange={(value) => form.setFieldValue("airline", value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <CountrySelect
                value={form.values.country || ""}
                onChange={(value) => form.setFieldValue("country", value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <DurationSlider
                value={form.values.maxDuration || 0}
                onChange={(value) => form.setFieldValue("maxDuration", value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!filters.hasActiveFilters || isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>

          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? "Searching..." : "Search Routes"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
          <CardDescription>
            {routes.length > 0
              ? `Found ${routes.length} routes matching your criteria`
              : "No routes found"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RouteTable
            data={routes}
            pagination={
              routes.length
                ? {
                    totalCount: routes.length,
                    currentPage,
                    totalPages,
                    limit: 10,
                  }
                : undefined
            }
            onPageChange={goToPage}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
