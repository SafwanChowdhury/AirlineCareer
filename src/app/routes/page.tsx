"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useRoutesList } from "@/lib/hooks/use-route-data";
import { useForm } from "@/lib/hooks/use-form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RouteTable } from "@/components/route-table";
import { RouteFilters } from "@/types";

export default function RoutesPage() {
  // Use our new hook to manage routes and filtering
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

  // Form for search and filters
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

  return (
    <div className="space-y-6 container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Route Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="airline">Airline</Label>
                <Input
                  id="airline"
                  placeholder="Search by airline..."
                  value={form.values.airline}
                  onChange={(e) =>
                    form.setFieldValue("airline", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure">Departure</Label>
                <Input
                  id="departure"
                  placeholder="IATA code or city..."
                  value={form.values.departure}
                  onChange={(e) =>
                    form.setFieldValue("departure", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival">Arrival</Label>
                <Input
                  id="arrival"
                  placeholder="IATA code or city..."
                  value={form.values.arrival}
                  onChange={(e) =>
                    form.setFieldValue("arrival", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Filter by country..."
                  value={form.values.country}
                  onChange={(e) =>
                    form.setFieldValue("country", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  form.resetForm();
                  filters.clearFilters();
                }}
                disabled={!filters.hasActiveFilters || isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !form.isDirty}
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Search Routes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Routes</CardTitle>
          {filters.hasActiveFilters && (
            <div className="flex gap-2 flex-wrap">
              {filters.activeFilters.airline && (
                <Badge variant="secondary">
                  Airline: {filters.filters.airline}
                </Badge>
              )}
              {filters.activeFilters.departure && (
                <Badge variant="secondary">
                  From: {filters.filters.departure}
                </Badge>
              )}
              {filters.activeFilters.arrival && (
                <Badge variant="secondary">To: {filters.filters.arrival}</Badge>
              )}
              {filters.activeFilters.country && (
                <Badge variant="secondary">
                  Country: {filters.filters.country}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && !routes.length ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : routes.length > 0 ? (
            <RouteTable
              data={routes}
              pagination={{
                totalCount: isLoading ? 0 : routes.length,
                currentPage,
                totalPages,
                limit: 10,
              }}
              onPageChange={goToPage}
              loading={isLoading}
            />
          ) : (
            <div className="text-muted-foreground text-center py-8">
              Use the search filters above to find routes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
