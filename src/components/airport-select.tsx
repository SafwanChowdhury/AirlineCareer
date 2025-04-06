// src/components/airport-select.tsx
import { useState } from "react";
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
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  // Use our enhanced airports hook with search functionality
  const {
    filteredAirports,
    isLoading,
    error,
    filterAirports,
    getAirportByIata,
  } = useAirports({
    excludeAirports,
    enableSearch: true,
  });

  // Get the selected airport
  const selectedAirport = value ? getAirportByIata(value) : null;

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
            onValueChange={filterAirports}
          />

          {isLoading ? (
            <CommandLoading>
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size={24} />
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
                          {airport.city_name}, {airport.country}
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
