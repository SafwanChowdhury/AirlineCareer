// src/components/career/AirlineSelect.tsx
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
  CommandLoading,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAirlines } from "@/lib/hooks/use-airline-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AirlineSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  excludeAirlines?: string[];
}

export function AirlineSelect({
  value,
  onChange,
  placeholder = "Select airline",
  excludeAirlines = [],
}: AirlineSelectProps) {
  const [open, setOpen] = useState(false);

  // Use our enhanced airlines hook with search functionality
  const {
    filteredAirlines,
    isLoading,
    error,
    filterAirlines,
    getAirlineByIata,
  } = useAirlines({
    excludeAirlines,
    enableSearch: true,
  });

  // Get the selected airline
  const selectedAirline = value ? getAirlineByIata(value) : null;

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
          {value && selectedAirline ? (
            <span>
              {selectedAirline.name} ({selectedAirline.iata})
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search airlines..."
            onValueChange={filterAirlines}
          />

          {isLoading ? (
            <CommandLoading>
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size={24} />
                <span className="ml-2">Loading airlines...</span>
              </div>
            </CommandLoading>
          ) : error ? (
            <CommandEmpty className="py-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
              <p className="mt-2 text-sm text-destructive">
                Failed to load airlines
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
              {filteredAirlines.length === 0 ? (
                <CommandEmpty>No airlines found.</CommandEmpty>
              ) : (
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  <CommandItem
                    key="clear"
                    onSelect={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === "" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Clear selection
                  </CommandItem>
                  {filteredAirlines.map((airline) => (
                    <CommandItem
                      key={airline.iata}
                      value={airline.iata}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === airline.iata ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {airline.name} ({airline.iata})
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
