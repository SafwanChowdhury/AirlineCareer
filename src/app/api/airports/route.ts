// src/app/api/airports/route.ts
import { NextRequest } from 'next/server';
import { getAirports, getCountries, getMaxDuration } from '@/lib/db';
import { handleApiError, successResponse, ApiError, logApiError } from '@/lib/api-utils';

/**
 * GET handler for airports API
 * Supports retrieving airports, countries, or max duration based on query parameters
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    // Handle different data types based on the 'type' parameter
    if (type === 'countries') {
      const countries = await getCountries();
      return successResponse(countries, {
        message: `Retrieved ${countries.length} countries`
      });
    }
    
    if (type === 'maxDuration') {
      const maxDuration = await getMaxDuration();
      return successResponse({ maxDuration }, {
        message: `Retrieved max duration: ${maxDuration} minutes`
      });
    }
    
    // Default: fetch all airports
    const airports = await getAirports();
    
    if (!airports || !Array.isArray(airports)) {
      throw new ApiError('Failed to fetch valid airport data', 500);
    }
    
    // Map database fields to expected client format
    const formattedAirports = airports
      .filter(airport => airport && typeof airport === 'object')
      .map(airport => ({
        iata: airport.iata || '',
        name: airport.name || '',
        city: airport.city_name || '',  // Map city_name to city for client consumption
        country: airport.country || ''
      }));
    
    return successResponse(formattedAirports, {
      message: `Retrieved ${formattedAirports.length} airports`
    });
  } catch (error) {
    logApiError('airports-api', error);
    return handleApiError(error);
  }
}