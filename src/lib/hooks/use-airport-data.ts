// src/lib/hooks/use-airport-data.ts
import { useSwrFetch } from './use-swr-fetch';
import { useState, useCallback, useEffect } from 'react';
import { Airport } from '@/types';
import { useSearch } from './use-search';

interface AirportHookOptions {
  /**
   * Exclude specific airports from the results
   */
  excludeAirports?: string[];
  
  /**
   * Enable search capabilities
   */
  enableSearch?: boolean;
  
  /**
   * Initial search term
   */
  initialSearch?: string;
}

interface AirportHookResult {
  /**
   * List of airports
   */
  airports: Airport[];
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Filter airports by search term
   */
  filterAirports: (searchTerm: string) => void;
  
  /**
   * Search capabilities (only available if enableSearch is true)
   */
  search?: ReturnType<typeof useSearch>;
  
  /**
   * Get an airport by IATA code
   */
  getAirportByIata: (iata: string) => Airport | undefined;
  
  /**
   * Filtered airports based on current search and exclusions
   */
  filteredAirports: Airport[];
}

/**
 * Hook for working with airport data
 * Provides filtering, searching, and loading capabilities
 */
export function useAirports({
  excludeAirports = [],
  enableSearch = false,
  initialSearch = ''
}: AirportHookOptions = {}): AirportHookResult {
  // Fetch airport data using SWR
  const { data: fetchedAirports, error, isLoading } = useSwrFetch<Airport[]>('/api/airports');
  
  // State
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Search capabilities 
  const searchHook = useSearch({
    initialTerm: initialSearch,
    debounceTime: 300,
    onSearch: setSearchTerm
  });
  
  // Use search only if enabled
  const search = enableSearch ? searchHook : undefined;
  
  // Process and filter airports
  useEffect(() => {
    if (!fetchedAirports) {
      setFilteredAirports([]);
      return;
    }
    
    // Start with all airports
    let filtered = [...fetchedAirports];
    
    // Filter out excluded airports
    if (excludeAirports.length > 0) {
      filtered = filtered.filter(airport => !excludeAirports.includes(airport.iata));
    }
    
    // Apply search term if provided
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(airport => (
        airport.iata.toLowerCase().includes(term) ||
        airport.name.toLowerCase().includes(term) ||
        airport.city_name.toLowerCase().includes(term) ||
        airport.country.toLowerCase().includes(term)
      ));
    }
    
    // Update filtered airports
    setFilteredAirports(filtered);
  }, [fetchedAirports, excludeAirports, searchTerm]);
  
  // Get an airport by IATA code
  const getAirportByIata = useCallback((iata: string) => {
    if (!fetchedAirports) return undefined;
    return fetchedAirports.find(airport => airport.iata === iata);
  }, [fetchedAirports]);
  
  // Filter airports by search term
  const filterAirports = useCallback((term: string) => {
    setSearchTerm(term);
    
    // Update search if enabled
    if (search) {
      search.setSearchTerm(term);
    }
  }, [search]);
  
  return {
    airports: fetchedAirports || [],
    isLoading,
    error: error || null,
    filterAirports,
    search,
    getAirportByIata,
    filteredAirports
  };
}

/**
 * Hook for getting a specific airport by IATA code
 */
export function useAirport(iata: string | null) {
  return useSwrFetch<Airport>(
    iata ? `/api/airports/${iata}` : null
  );
}

/**
 * Hook for getting a list of countries
 */
export function useCountries() {
  return useSwrFetch<{ country: string }[]>('/api/airports?type=countries');
}

/**
 * Hook for getting the maximum flight duration
 */
export function useMaxDuration() {
  return useSwrFetch<{ maxDuration: number }>('/api/airports?type=maxDuration');
}