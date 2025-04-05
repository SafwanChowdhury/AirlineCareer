import { useSwrFetch } from './use-swr-fetch';
import useSWR from 'swr';
import { logger, logError } from '@/lib/logger';

export interface Airport {
  iata: string;
  name: string;
  city: string;  // This will match what the API returns after mapping from city_name
  country: string;
}

// A more robust fetcher that handles different response formats
const airportFetcher = async (url: string): Promise<Airport[]> => {
  logger.info('airport-data', `Fetching airports from: ${url}`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.error('airport-data', `Error response: ${response.status}`);
      throw new Error(`Failed to fetch airports: ${response.status}`);
    }
    
    const data = await response.json();
    logger.debug('airport-data', 'Raw API response type:', {
      type: typeof data,
      isArray: Array.isArray(data),
      hasData: data && typeof data === 'object' && 'data' in data,
      hasSuccess: data && typeof data === 'object' && 'success' in data
    });
    
    // Handle different response formats
    if (data) {
      // Handle success response format
      if (data.success === true && Array.isArray(data.data)) {
        logger.info('airport-data', `Using success.data format, found: ${data.data.length} airports`);
        return data.data;
      }
      // Handle direct array format
      else if (Array.isArray(data)) {
        logger.info('airport-data', `Using direct array format, found: ${data.length} airports`);
        return data;
      }
      // Log the actual data structure for debugging
      else {
        logger.error('airport-data', 'Unexpected data format', { 
          dataType: typeof data,
          keys: data && typeof data === 'object' ? Object.keys(data) : 'not an object',
          preview: data ? JSON.stringify(data).substring(0, 200) + '...' : 'null or undefined'
        });
      }
    }
    
    logger.warn('airport-data', 'Returning empty array as fallback');
    return []; // Return empty array as fallback
  } catch (error) {
    logError('airport-data', error, { url });
    throw error; // Re-throw to let SWR handle it
  }
};

export function useAirports() {
  const result = useSWR<Airport[]>('/api/airports', airportFetcher);
  
  // Add extra debug logging
  if (result.error) {
    logError('airport-data', result.error, { message: 'SWR error in useAirports hook' });
  }
  
  if (result.data) {
    logger.info('airport-data', `SWR data returned: ${result.data.length} airports`);
    if (result.data.length > 0) {
      logger.debug('airport-data', 'Sample airport:', { sample: result.data[0] });
    }
  }
  
  return result;
} 