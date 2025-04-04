import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Airport {
  iata: string;
  name: string;
  city_name: string;
  country: string;
}

interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AirportSelect({
  value,
  onChange,
  placeholder = "Select airport...",
}: AirportSelectProps) {
  const [open, setOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);

  useEffect(() => {
    async function fetchAirports() {
      try {
        const response = await fetch("/api/airports");
        if (!response.ok) {
          throw new Error("Failed to fetch airports");
        }
        const data = await response.json();
        setAirports(data);
      } catch (error) {
        console.error("Error fetching airports:", error);
      }
    }

    fetchAirports();
  }, []);

  const selectedAirport = airports.find((a) => a.iata === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <span>
              {selectedAirport
                ? `${selectedAirport.city_name} (${selectedAirport.iata})`
                : value}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search airports..." />
          <CommandEmpty>No airport found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {airports.map((airport) => (
              <CommandItem
                key={airport.iata}
                value={`${airport.city_name} ${airport.iata} ${airport.country}`}
                onSelect={() => {
                  onChange(airport.iata);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === airport.iata ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>
                    {airport.city_name} ({airport.iata})
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {airport.country}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
