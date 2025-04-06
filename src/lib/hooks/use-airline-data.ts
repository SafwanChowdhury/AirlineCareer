// src/lib/hooks/use-airline-data.ts
import { useSwrFetch } from './use-swr-fetch';
import { useState, useCallback, useEffect } from 'react';
import { Airline } from '@/types';
import { useSearch } from './use-search';

interface AirlineHookOptions {
  /**
   * Exclude specific airlines from the results
   */
  excludeAirlines?: string[];
  
  /**
   * Enable search capabilities
   */
  enableSearch?: boolean;
  
  /**
   * Initial search term
   */
  initialSearch?: string;
}

interface AirlineHookResult {
  /**
   * List of airlines
   */
  airlines: Airline[];
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Filter airlines by search term
   */
  filterAirlines: (searchTerm: string) => void;
  
  /**
   * Search capabilities (only available if enableSearch is true)
   */
  search?: ReturnType<typeof useSearch>;
  
  /**
   * Get an airline by IATA code
   */
  getAirlineByIata: (iata: string) => Airline | undefined;
  
  /**
   * Filtered airlines based on current search and exclusions
   */
  filteredAirlines: Airline[];
}

/**
 * Hook for working with airline data
 * Provides filtering, searching, and loading capabilities
 */
export function useAirlines({
  excludeAirlines = [],
  enableSearch = false,
  initialSearch = ''
}: AirlineHookOptions = {}): AirlineHookResult {
  // Fetch airline data using SWR
  const { data: fetchedAirlines, error, isLoading } = useSwrFetch<Airline[]>('/api/airlines');
  
  // State
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Search capabilities 
  const searchHook = useSearch({
    initialTerm: initialSearch,
    debounceTime: 300,
    onSearch: setSearchTerm
  });
  
  // Use search only if enabled
  const search = enableSearch ? searchHook : undefined;
  
  // Process and filter airlines
  useEffect(() => {
    if (!fetchedAirlines) {
      setFilteredAirlines([]);
      return;
    }
    
    // Start with all airlines
    let filtered = [...fetchedAirlines];
    
    // Filter out excluded airlines
    if (excludeAirlines.length > 0) {
      filtered = filtered.filter(airline => !excludeAirlines.includes(airline.iata));
    }
    
    // Apply search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(airline => (
        airline.iata.toLowerCase().includes(term) ||
        airline.name.toLowerCase().includes(term)
      ));
    }
    
    // Update filtered airlines
    setFilteredAirlines(filtered);
  }, [fetchedAirlines, excludeAirlines, searchTerm]);
  
  // Get an airline by IATA code
  const getAirlineByIata = useCallback((iata: string) => {
    if (!fetchedAirlines) return undefined;
    return fetchedAirlines.find(airline => airline.iata === iata);
  }, [fetchedAirlines]);
  
  // Filter airlines by search term
  const filterAirlines = useCallback((term: string) => {
    setSearchTerm(term);
    
    // Update search if enabled
    if (search) {
      search.setSearchTerm(term);
    }
  }, [search]);
  
  return {
    airlines: fetchedAirlines || [],
    isLoading,
    error: error || null,
    filterAirlines,
    search,
    getAirlineByIata,
    filteredAirlines
  };
}

/**
 * Hook for getting a specific airline by IATA code
 */
export function useAirline(iata: string | null) {
  return useSwrFetch<Airline>(
    iata ? `/api/airlines/${iata}` : null
  );
}