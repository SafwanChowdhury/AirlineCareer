// src/lib/hooks/use-route-data.ts
import { useListView, ListViewOptions } from './use-list-view';
import { useDetailView, DetailViewOptions } from './use-detail-view';
import { RouteFilters, RoutesResponse, RouteDetails } from '@/types';

/**
 * Fetch routes from the API with the given search params
 */
async function fetchRoutes(params: URLSearchParams): Promise<RoutesResponse> {
  const response = await fetch(`/api/routes?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch routes');
  }
  
  return {
    data: data.data,
    pagination: data.pagination
  };
}

/**
 * Fetch a single route by ID
 */
async function fetchRoute(id: string | number): Promise<RouteDetails> {
  const response = await fetch(`/api/routes/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch route with ID ${id}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || `Failed to fetch route with ID ${id}`);
  }
  
  return data.data;
}

/**
 * Hook for managing routes list view
 * Combines pagination, search, and filtering for routes
 */
export function useRoutesList(options?: Partial<ListViewOptions<RouteDetails>>) {
  return useListView<RouteDetails>({
    fetchFn: fetchRoutes,
    autoFetch: true,
    ...options
  });
}

/**
 * Hook for managing route detail view
 */
export function useRouteDetail(
  id: string | number | null, 
  options?: Partial<Omit<DetailViewOptions<RouteDetails>, 'id' | 'fetchFn'>>
) {
  return useDetailView<RouteDetails>({
    id,
    fetchFn: fetchRoute,
    autoFetch: true,
    ...options
  });
}

/**
 * Search the route list with a specific term
 */
export async function searchRoutes(term: string): Promise<RouteDetails[]> {
  const params = new URLSearchParams();
  params.append('search', term);
  
  const response = await fetchRoutes(params);
  return response.data;
}

/**
 * Fetch routes with specific filters
 */
export async function filterRoutes(filters: Partial<RouteFilters>): Promise<RouteDetails[]> {
  const params = new URLSearchParams();
  
  // Add non-empty filters to params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await fetchRoutes(params);
  return response.data;
}

/**
 * Get statistics about routes
 */
export async function getRouteStatistics(): Promise<{
  totalRoutes: number;
  totalAirlines: number;
  totalAirports: number;
  averageDistance: number;
  averageDuration: number;
}> {
  const response = await fetch('/api/routes/statistics');
  
  if (!response.ok) {
    throw new Error('Failed to fetch route statistics');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch route statistics');
  }
  
  return data.data;
}