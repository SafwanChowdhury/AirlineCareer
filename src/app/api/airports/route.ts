// src/app/api/airports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAirports, getCountries, getMaxDuration } from '@/lib/db';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { logger, logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    logger.info('airports-api', 'Processing request');
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    if (type === 'countries') {
      logger.info('airports-api', 'Fetching countries');
      const countries = await getCountries();
      logger.info('airports-api', `Found ${countries.length} countries`);
      return successResponse(countries);
    }
    
    if (type === 'maxDuration') {
      logger.info('airports-api', 'Fetching max duration');
      const maxDuration = await getMaxDuration();
      logger.info('airports-api', `Max duration: ${maxDuration}`);
      return successResponse({ maxDuration });
    }
    
    // Fetch airports
    logger.info('airports-api', 'Fetching airports');
    const airports = await getAirports();
    
    if (!airports || !Array.isArray(airports)) {
      logger.error('airports-api', 'Invalid airports data returned from database', {
        type: typeof airports,
        isArray: Array.isArray(airports),
        sample: airports ? JSON.stringify(airports).substring(0, 100) : 'null'
      });
      throw new ApiError('Failed to fetch valid airport data', 500);
    }
    
    logger.info('airports-api', `Found ${airports.length} airports`);
    
    // Map the database fields to match the expected format
    const formattedAirports = airports.map(airport => {
      if (!airport || typeof airport !== 'object') {
        logger.error('airports-api', 'Invalid airport object', { airport });
        return null;
      }
      
      return {
        iata: airport.iata || '',
        name: airport.name || '',
        city: airport.city_name || '',  // Map city_name to city for client consumption
        country: airport.country || ''
      };
    }).filter(Boolean); // Remove any null entries
    
    logger.info('airports-api', `Formatted ${formattedAirports.length} airports`);
    
    // Log the first few airports for debugging
    if (formattedAirports.length > 0) {
      logger.debug('airports-api', 'Sample airport', { sample: formattedAirports[0] });
    }
    
    return successResponse(formattedAirports);
  } catch (error) {
    logError('airports-api', error);
    return handleApiError(error instanceof ApiError ? error : new ApiError('Failed to fetch airports', 500));
  }
}