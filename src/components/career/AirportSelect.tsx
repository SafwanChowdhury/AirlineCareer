import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAirports } from "@/lib/hooks/use-airport-data";
import { toast } from "sonner";
import { logger, logError } from "@/lib/logger";

interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeAirports?: string[];
}

export function AirportSelect({
  value,
  onChange,
  placeholder = "Select airport",
  excludeAirports = [],
}: AirportSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: airports, isLoading, error } = useAirports();
  const [searchTerm, setSearchTerm] = useState("");

  // Log information about airports for debugging
  useEffect(() => {
    logger.debug("airport-select", "Airports state update", {
      count: airports?.length || 0,
      value,
      isLoading,
      hasError: !!error,
    });

    // Check if airports is really an array
    if (airports && !Array.isArray(airports)) {
      logError("airport-select", new Error("Airports is not an array"), {
        airports: typeof airports,
        value,
      });
    }
  }, [airports, value, isLoading, error]);

  // Show error toast when loading fails
  useEffect(() => {
    if (error) {
      logError("airport-select", error, { message: "Error loading airports" });
      toast.error("Failed to load airports. Please try again later.");
    }
  }, [error]);

  // Safely filter airports ensuring we have an array to work with
  const filteredAirports = (() => {
    // Safety check to make sure airports is an array
    if (!airports || !Array.isArray(airports)) {
      logError("airport-select", new Error("Invalid airports data"), {
        type: typeof airports,
        isArray: Array.isArray(airports),
      });
      return [];
    }

    try {
      const filtered = airports
        .filter(
          (airport) =>
            airport &&
            typeof airport === "object" &&
            !excludeAirports.includes(airport.iata)
        )
        .filter((airport) => {
          if (!searchTerm) return true;
          if (!airport) return false;

          const term = searchTerm.toLowerCase();
          return (
            airport.iata?.toLowerCase().includes(term) ||
            airport.name?.toLowerCase().includes(term) ||
            airport.city?.toLowerCase().includes(term) ||
            airport.country?.toLowerCase().includes(term)
          );
        });

      logger.debug(
        "airport-select",
        `Filtered ${filtered.length} airports from ${airports.length} total`,
        {
          searchTerm: searchTerm || "(empty)",
          excludedCount: excludeAirports.length,
        }
      );

      return filtered;
    } catch (err) {
      logError("airport-select", err, { message: "Error filtering airports" });
      return [];
    }
  })();

  // Safely find the selected airport
  const selectedAirport = (() => {
    if (!airports || !Array.isArray(airports)) return null;
    try {
      return (
        airports.find((airport) => airport && airport.iata === value) || null
      );
    } catch (err) {
      logError("airport-select", err, {
        message: "Error finding selected airport",
        value,
      });
      return null;
    }
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {value && selectedAirport ? (
            <span>
              {selectedAirport.name} ({selectedAirport.iata})
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search airports..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />

          {isLoading ? (
            <CommandLoading>
              <div className="flex items-center justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-2">Loading airports...</span>
              </div>
            </CommandLoading>
          ) : error ? (
            <CommandEmpty className="py-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
              <p className="mt-2 text-sm text-destructive">
                Failed to load airports
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CommandEmpty>
          ) : (
            <>
              {filteredAirports.length === 0 ? (
                <CommandEmpty>No airports found.</CommandEmpty>
              ) : (
                <CommandList>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {filteredAirports.map((airport) => (
                      <CommandItem
                        key={airport.iata}
                        value={airport.iata}
                        onSelect={(currentValue) => {
                          onChange(currentValue === value ? "" : currentValue);
                          setOpen(false);
                          logger.debug("airport-select", "Airport selected", {
                            iata: currentValue,
                            name: airport.name,
                          });
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === airport.iata ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {airport.name} ({airport.iata})
                        <span className="ml-2 text-muted-foreground">
                          {airport.city}, {airport.country}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
