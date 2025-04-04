// src/components/airline-select.tsx
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
import { Airline } from "@/types";

interface AirlineSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AirlineSelect({ value, onChange }: AirlineSelectProps) {
  const [open, setOpen] = useState(false);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const response = await fetch("/api/airlines");
        if (!response.ok) throw new Error("Failed to fetch airlines");
        const data = await response.json();
        setAirlines(data);
      } catch (error) {
        console.error("Error fetching airlines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
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
            ? airlines.find((airline) => airline.name === value)?.name || value
            : "Select Airline..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search airline..." />
          <CommandEmpty>No airline found.</CommandEmpty>
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
            {airlines.map((airline) => (
              <CommandItem
                key={airline.iata + airline.name}
                onSelect={() => {
                  onChange(airline.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === airline.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {airline.name} ({airline.iata})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
