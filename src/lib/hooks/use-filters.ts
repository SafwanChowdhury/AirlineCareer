// src/lib/hooks/use-filters.ts
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RouteFilters } from '@/types';

export interface FilterOptions {
  /**
   * Initial filter values
   */
  initialFilters?: Partial<RouteFilters>;
  
  /**
   * Should filters be persisted to URL
   */
  persistToUrl?: boolean;
  
  /**
   * Callback when filters change
   */
  onFilterChange?: (filters: RouteFilters) => void;
}

export interface FilterResult {
  /**
   * Current filter values
   */
  filters: RouteFilters;
  
  /**
   * Update a single filter
   */
  setFilter: <K extends keyof RouteFilters>(key: K, value: RouteFilters[K]) => void;
  
  /**
   * Update multiple filters at once
   */
  setFilters: (newFilters: Partial<RouteFilters>) => void;
  
  /**
   * Reset all filters to initial values
   */
  resetFilters: () => void;
  
  /**
   * Clear all filters
   */
  clearFilters: () => void;
  
  /**
   * Get a query string representation of filters
   */
  getQueryString: () => string;
  
  /**
   * Has any filter been applied
   */
  hasActiveFilters: boolean;
  
  /**
   * Specifically active filters
   */
  activeFilters: Partial<Record<keyof RouteFilters, boolean>>;
}

/**
 * Default empty filters object
 */
const DEFAULT_FILTERS: RouteFilters = {
  airline: '',
  departure: '',
  arrival: '',
  country: '',
  maxDuration: 0
};

/**
 * Hook for managing route filters with URL persistence
 */
export function useFilters({ 
  initialFilters = {},
  persistToUrl = true,
  onFilterChange
}: FilterOptions = {}): FilterResult {
  // Get URL search params if we're persisting to URL
  const searchParams = useSearchParams();
  
  // Initialize filters from URL or initial values
  const getInitialFilters = (): RouteFilters => {
    if (persistToUrl && searchParams) {
      const filtersFromUrl: Partial<RouteFilters> = {};
      
      if (searchParams.has('airline')) filtersFromUrl.airline = searchParams.get('airline') || '';
      if (searchParams.has('departure')) filtersFromUrl.departure = searchParams.get('departure') || '';
      if (searchParams.has('arrival')) filtersFromUrl.arrival = searchParams.get('arrival') || '';
      if (searchParams.has('country')) filtersFromUrl.country = searchParams.get('country') || '';
      if (searchParams.has('maxDuration')) {
        const duration = parseInt(searchParams.get('maxDuration') || '0', 10);
        filtersFromUrl.maxDuration = isNaN(duration) ? 0 : duration;
      }
      
      return { ...DEFAULT_FILTERS, ...filtersFromUrl };
    }
    
    return { ...DEFAULT_FILTERS, ...initialFilters };
  };
  
  // State for filters
  const [filters, setFiltersState] = useState<RouteFilters>(getInitialFilters);
  
  // Update a single filter
  const setFilter = useCallback(<K extends keyof RouteFilters>(key: K, value: RouteFilters[K]) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Update multiple filters at once
  const setFilters = useCallback((newFilters: Partial<RouteFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Reset filters to initial values
  const resetFilters = useCallback(() => {
    setFiltersState({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);
  
  // Get query string representation of filters
  const getQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      const filterKey = key as keyof RouteFilters;
      // Only add non-empty values
      if (value) {
        params.append(filterKey, String(value));
      }
    });
    
    return params.toString();
  }, [filters]);
  
  // Calculate active filters
  const activeFilters: Partial<Record<keyof RouteFilters, boolean>> = {};
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    const isActive = key === 'maxDuration' 
      ? value > 0 
      : value !== '' && value !== undefined;
      
    activeFilters[key as keyof RouteFilters] = isActive;
    return isActive;
  });
  
  // Trigger callback when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);
  
  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearFilters,
    getQueryString,
    hasActiveFilters,
    activeFilters
  };
}