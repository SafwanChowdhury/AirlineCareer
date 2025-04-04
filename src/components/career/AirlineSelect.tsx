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
import { AirlineSelectProps } from "@/lib/types";

interface Airline {
  iata: string;
  name: string;
}

export function AirlineSelect({
  value,
  onChange,
  placeholder = "Select airline...",
  disabled = false,
}: AirlineSelectProps) {
  const [open, setOpen] = useState(false);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAirlines() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/airlines");
        if (!response.ok) {
          throw new Error("Failed to fetch airlines");
        }
        const data = await response.json();
        setAirlines(data);
      } catch (error) {
        console.error("Error fetching airlines:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch airlines"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAirlines();
  }, []);

  const selectedAirline = airlines.find((a) => a.iata === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {value ? (
            <span>
              {selectedAirline
                ? `${selectedAirline.name} (${selectedAirline.iata})`
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
          <CommandInput placeholder="Search airlines..." />
          <CommandEmpty>
            {loading ? "Loading..." : error || "No airline found."}
          </CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            <CommandItem
              value="clear-selection"
              onSelect={() => {
                onChange("");
                setOpen(false);
              }}
              disabled={disabled}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !value ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-muted-foreground">Clear selection</span>
            </CommandItem>
            {airlines.map((airline) => (
              <CommandItem
                key={airline.iata}
                value={`${airline.name} ${airline.iata}`}
                onSelect={() => {
                  onChange(airline.iata);
                  setOpen(false);
                }}
                disabled={disabled}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === airline.iata ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>
                  {airline.name} ({airline.iata})
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
