// src/lib/hooks/use-detail-view.ts
import { useState, useCallback, useEffect } from 'react';

export interface DetailViewOptions<T, P = any> {
  /**
   * ID of the item to fetch
   */
  id: string | number | null;
  
  /**
   * Fetch function that returns a Promise with the item data
   */
  fetchFn: (id: string | number, params?: P) => Promise<T>;
  
  /**
   * Additional parameters to pass to fetch function
   */
  params?: P;
  
  /**
   * Auto-fetch data when id changes
   */
  autoFetch?: boolean;
  
  /**
   * Refresh interval in milliseconds (0 to disable)
   */
  refreshInterval?: number;
  
  /**
   * Dependencies array that will trigger a refetch when changed
   */
  dependencies?: any[];
  
  /**
   * Callback to run when data is successfully loaded
   */
  onLoad?: (data: T) => void;
  
  /**
   * Callback to run when an error occurs
   */
  onError?: (error: Error) => void;
}

export interface DetailViewResult<T, P = any> {
  /**
   * The detail data
   */
  data: T | null;
  
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
  fetchData: (params?: P) => Promise<void>;
  
  /**
   * Refresh data
   */
  refresh: () => Promise<void>;
  
  /**
   * Is data currently being refreshed
   */
  isRefreshing: boolean;
  
  /**
   * Set data manually (for optimistic updates)
   */
  setData: (data: T | null) => void;
  
  /**
   * Clear data
   */
  clearData: () => void;
  
  /**
   * When data was last fetched (timestamp)
   */
  lastFetched: number | null;
}

/**
 * Hook for managing detail views
 * Provides a standardized interface for viewing and managing a single item
 */
export function useDetailView<T, P = any>({
  id,
  fetchFn,
  params,
  autoFetch = true,
  refreshInterval = 0,
  dependencies = [],
  onLoad,
  onError
}: DetailViewOptions<T, P>): DetailViewResult<T, P> {
  // State
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  
  // Fetch data
  const fetchData = useCallback(async (customParams?: P) => {
    if (!id) {
      return;
    }
    
    const wasPreviouslyLoaded = data !== null;
    
    // Set loading state
    if (!wasPreviouslyLoaded) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);
    
    try {
      const result = await fetchFn(id, customParams || params);
      
      setData(result);
      setLastFetched(Date.now());
      
      if (onLoad) {
        onLoad(result);
      }
    } catch (err) {
      console.error(`Error fetching item with id ${id}:`, err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      if (onError) {
        onError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, fetchFn, params, data, onLoad, onError]);
  
  // Alias for fetchData for better readability
  const refresh = useCallback(() => fetchData(), [fetchData]);
  
  // Clear data
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setLastFetched(null);
  }, []);
  
  // Auto-fetch when id changes
  useEffect(() => {
    if (autoFetch && id) {
      fetchData();
    } else if (!id) {
      // Clear data if id is null
      clearData();
    }
  }, [id, autoFetch, fetchData, clearData]);
  
  // Fetch when dependencies change
  useEffect(() => {
    // Only run this effect when:
    // 1. We have a valid ID
    // 2. Data was previously loaded (not initial load - that's handled by autoFetch)
    // 3. We have external dependencies provided
    if (id && data !== null && dependencies.length > 0) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]); // Only include external dependencies, not id/fetchData/data 
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (refreshInterval <= 0 || !id) return;
    
    const intervalId = setInterval(() => {
      // Only refresh if not already loading
      if (!isLoading && !isRefreshing) {
        fetchData();
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, isLoading, isRefreshing, fetchData, id]);
  
  return {
    data,
    isLoading,
    isRefreshing,
    error,
    fetchData,
    refresh,
    setData,
    clearData,
    lastFetched
  };
}