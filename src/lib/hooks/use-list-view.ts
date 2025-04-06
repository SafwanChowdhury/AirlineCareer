// src/lib/hooks/use-list-view.ts
import { useCallback, useEffect, useState } from "react";
import { usePagination, PaginationOptions, PaginationResult } from "./use-pagination";
import { useSearch, SearchOptions, SearchResult } from "./use-search";
import { useFilters, FilterOptions, FilterResult } from "./use-filters";
import { PaginationInfo } from "@/lib/types";

// Type adapter to convert different pagination info formats to a consistent format
type AdaptablePaginationInfo = {
  totalCount: number;
  currentPage?: number;
  page?: number;
  totalPages: number;
  limit: number;
};

export interface ListViewOptions<T> {
  /**
   * Fetch function that returns a Promise with data and pagination
   */
  fetchFn: (params: URLSearchParams) => Promise<{ 
    data: T[]; 
    pagination?: AdaptablePaginationInfo;
  }>;
  
  /**
   * Pagination options
   */
  paginationOptions?: PaginationOptions;
  
  /**
   * Search options
   */
  searchOptions?: SearchOptions;
  
  /**
   * Filter options
   */
  filterOptions?: FilterOptions;
  
  /**
   * Auto-fetch data on mount
   */
  autoFetch?: boolean;
  
  /**
   * Refresh interval in milliseconds (0 to disable)
   */
  refreshInterval?: number;
}

export interface ListViewResult<T> extends PaginationResult {
  /**
   * Data items
   */
  items: T[];
  
  /**
   * Search related functions
   */
  search: SearchResult;
  
  /**
   * Filter related functions
   */
  filters: FilterResult;
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Fetch data manually
   */
  fetchData: () => Promise<void>;
  
  /**
   * Refresh data
   */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing list views with pagination, search, and filtering
 * Combines multiple hooks into a single, convenient interface
 */
export function useListView<T>({
  fetchFn,
  paginationOptions = {},
  searchOptions = {},
  filterOptions = {},
  autoFetch = true,
  refreshInterval = 0
}: ListViewOptions<T>): ListViewResult<T> {
  // State
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Use hooks for pagination, search, and filtering
  const pagination = usePagination(paginationOptions);
  const search = useSearch({
    ...searchOptions,
    onSearch: () => {
      // Reset pagination when search changes
      pagination.goToPage(1);
      fetchData();
    }
  });
  const filters = useFilters({
    ...filterOptions,
    onFilterChange: () => {
      // Reset pagination when filters change
      pagination.goToPage(1);
      fetchData();
    }
  });
  
  // Build query parameters for API call
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    // Add pagination
    params.append('page', String(pagination.currentPage));
    params.append('limit', String(pagination.itemsPerPage));
    
    // Add search
    if (search.searchTerm) {
      params.append('search', search.searchTerm);
    }
    
    // Add filters
    if (filters.hasActiveFilters) {
      Object.entries(filters.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    return params;
  }, [pagination, search, filters]);
  
  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = buildQueryParams();
      const result = await fetchFn(params);
      
      setItems(result.data);
      
      // Update pagination if info was returned
      if (result.pagination) {
        const adaptedPagination: PaginationInfo = {
          totalCount: result.pagination.totalCount,
          currentPage: result.pagination.currentPage || result.pagination.page || 1,
          totalPages: result.pagination.totalPages,
          limit: result.pagination.limit
        };
        pagination.updateFromResponse(adaptedPagination);
      }
      
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [buildQueryParams, fetchFn, pagination]);
  
  // Alias for fetchData for better readability
  const refresh = fetchData;
  
  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      // Only refresh if not already loading
      if (!isLoading) {
        fetchData();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, isLoading, fetchData]);
  
  // Fetch when pagination changes
  useEffect(() => {
    // Skip initial render
    if (lastFetchTime > 0) {
      fetchData();
    }
  }, [pagination.currentPage, pagination.itemsPerPage, fetchData, lastFetchTime]);
  
  return {
    // Data
    items,
    
    // Loading state
    isLoading,
    error,
    
    // Functions
    fetchData,
    refresh,
    
    // Hooks
    ...pagination,
    search,
    filters
  };
}