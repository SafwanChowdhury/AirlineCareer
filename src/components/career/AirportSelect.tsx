import { useState } from "react";
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
import { useAirports } from "@/lib/hooks/use-airport-data";

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
  const { data: airports, isLoading } = useAirports();

  const filteredAirports =
    airports?.filter((airport) => !excludeAirports.includes(airport.iata)) ??
    [];

  const selectedAirport = airports?.find((airport) => airport.iata === value);

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
          {value ? (
            <span>
              {selectedAirport?.name} ({selectedAirport?.iata})
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
          <CommandEmpty>No airports found.</CommandEmpty>
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
                  {airport.city}, {airport.country}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
