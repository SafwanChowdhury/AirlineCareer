// src/components/route-table.tsx
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { RouteDetails, RoutesResponse } from "@/types";

interface RouteTableProps {
  data: RoutesResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export function RouteTable({
  data,
  currentPage,
  onPageChange,
  loading,
}: RouteTableProps) {
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-md">
        <h3 className="text-lg font-medium">No routes found</h3>
        <p className="text-gray-500">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  // Format flight duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div>
      <Table>
        <TableCaption>
          Showing {data.data.length} of {data.pagination.totalCount} routes
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Departure</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Airline</TableHead>
            <TableHead className="text-right">Distance</TableHead>
            <TableHead className="text-right">Duration</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((route) => (
            <TableRow key={route.route_id}>
              <TableCell className="font-medium">
                {route.departure_city} ({route.departure_iata})
                <div className="text-xs text-gray-500">
                  {route.departure_country}
                </div>
              </TableCell>
              <TableCell>
                {route.arrival_city} ({route.arrival_iata})
                <div className="text-xs text-gray-500">
                  {route.arrival_country}
                </div>
              </TableCell>
              <TableCell>
                {route.airline_name}
                <div className="text-xs text-gray-500">
                  {route.airline_iata}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {route.distance_km} km
              </TableCell>
              <TableCell className="text-right">
                {formatDuration(route.duration_min)}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    {selectedRoute && (
                      <>
                        <DialogHeader>
                          <DialogTitle>Route Details</DialogTitle>
                          <DialogDescription>
                            Full information about this route
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Departure</h4>
                            <p>
                              {selectedRoute.departure_city} (
                              {selectedRoute.departure_iata})
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedRoute.departure_country}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Arrival</h4>
                            <p>
                              {selectedRoute.arrival_city} (
                              {selectedRoute.arrival_iata})
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedRoute.arrival_country}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Airline</h4>
                            <p>
                              {selectedRoute.airline_name} (
                              {selectedRoute.airline_iata})
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Flight Details</h4>
                            <p>Distance: {selectedRoute.distance_km} km</p>
                            <p>
                              Duration:{" "}
                              {formatDuration(selectedRoute.duration_min)}
                            </p>
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose asChild>
                            <Button>Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {data.pagination.totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= data.pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
