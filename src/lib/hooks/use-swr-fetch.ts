import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { ApiError } from '../api-utils';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

// Default configuration with better error handling and cache behavior
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000, // 5 seconds
  dedupingInterval: 2000, // 2 seconds
};

/**
 * Fetches data from the API with standardized error handling and response parsing
 * @param url The URL to fetch from
 * @returns The parsed data from the API
 * @throws ApiError if the request fails or returns an error
 */
async function fetcher<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch data: ${response.statusText}`,
        response.status
      );
    }
    
    const json = await response.json();
    
    // Check if the response has the expected success property
    if (typeof json.success === 'boolean') {
      if (!json.success) {
        // Handle API error response
        throw new ApiError(json.error || 'Unknown error occurred');
      }
      return json.data;
    } 
    
    // Handle legacy API responses that don't have the success property
    // but might be valid data (direct array or object)
    return json;
  } catch (error) {
    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Convert other errors to API errors for consistent handling
    console.error('API fetch error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Hook to fetch data using SWR with standardized error handling
 * @param url The URL to fetch from, or null to skip fetching
 * @param config Additional SWR configuration
 * @returns SWR response object with data, error, and loading state
 */
export function useSwrFetch<T>(
  url: string | null,
  config?: SWRConfiguration
): SWRResponse<T, Error> {
  return useSWR<T, Error>(
    url,
    url ? fetcher : null,
    {
      ...defaultConfig,
      ...config
    }
  );
} 