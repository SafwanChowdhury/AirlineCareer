// src/components/airport-select.tsx
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { Airport } from "@/types";

interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function AirportSelect({
  value,
  onChange,
  placeholder,
}: AirportSelectProps) {
  const [open, setOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const response = await fetch("/api/airports");
        if (!response.ok) throw new Error("Failed to fetch airports");
        const data = await response.json();
        setAirports(data);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirports();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={loading}
        >
          {value
            ? airports.find(
                (airport) =>
                  airport.iata === value || airport.city_name === value
              )?.city_name || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search airport..." />
          <CommandEmpty>No airport found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
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
            {airports.map((airport) => (
              <CommandItem
                key={airport.iata}
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
                {airport.city_name} ({airport.iata}), {airport.country}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
