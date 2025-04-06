// src/components/country-select.tsx
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
import { useCountries } from "@/lib/hooks/use-airport-data";
import { useSearch } from "@/lib/hooks/use-search";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country...",
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);

  // Fetch countries data
  const { data: countries = [], error, isLoading } = useCountries();

  // Use search hook for country filtering
  const search = useSearch({
    debounceTime: 300,
  });

  // Filter countries based on search term
  const filteredCountries = search.searchTerm
    ? countries.filter((country) =>
        country.country.toLowerCase().includes(search.searchTerm.toLowerCase())
      )
    : countries;

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
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search country..."
            onValueChange={search.setSearchTerm}
          />

          {isLoading ? (
            <CommandLoading>
              <div className="flex items-center justify-center py-6">
                <LoadingSpinner size={24} />
                <span className="ml-2">Loading countries...</span>
              </div>
            </CommandLoading>
          ) : error ? (
            <CommandEmpty className="py-6 text-center">
              <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
              <p className="mt-2 text-sm text-destructive">
                Failed to load countries
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
          ) : filteredCountries.length === 0 ? (
            <CommandEmpty>No countries found.</CommandEmpty>
          ) : (
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
              {filteredCountries.map((item) => (
                <CommandItem
                  key={item.country}
                  onSelect={() => {
                    onChange(item.country);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.country ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.country}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
