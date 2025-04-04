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
import { useAirlines, type Airline } from "@/lib/hooks/use-airline-data";

interface AirlineSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AirlineSelect({
  value,
  onChange,
  placeholder = "Select airline",
}: AirlineSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: airlines, isLoading } = useAirlines();

  const selectedAirline = airlines?.find(
    (airline: Airline) => airline.iata === value
  );

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
              {selectedAirline?.name} ({selectedAirline?.iata})
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
          <CommandEmpty>No airlines found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {(airlines ?? []).map((airline: Airline) => (
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
                <span className="ml-2 text-muted-foreground">
                  {airline.country}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
