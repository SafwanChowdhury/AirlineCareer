// src/app/api/career/history/stats/route.ts
import {
  getFlightHistoryStats,
  getPilotProfileById
} from '@/lib/career-db';
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for retrieving flight history statistics
 * Returns aggregated statistics about a pilot's flight history
 */
export async function GET(request: Request) {
  try {
    // Get the pilot ID from the URL parameters
    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get('pilotId');
    
    if (!pilotIdParam) {
      throw new ApiError('Pilot ID is required', 400);
    }
    
    // Validate and parse the pilot ID
    const pilotId = validateId(pilotIdParam);
    
    // Check if the pilot exists
    const pilot = await getPilotProfileById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404, { pilotId });
    }
    
    // Get the flight statistics for this pilot
    const stats = await getFlightHistoryStats(pilotId);
    
    // If no flight history exists, return empty stats
    if (!stats) {
      return successResponse({
        total_flights: 0,
        total_minutes: 0,
        total_hours: 0,
        airports_visited: 0,
        airlines_flown: 0
      }, {
        message: `No flight history found for pilot: ${pilot.name}`
      });
    }
    
    // Return the flight history statistics
    return successResponse(stats, {
      message: `Retrieved flight statistics for pilot: ${pilot.name}`
    });
  } catch (error) {
    logApiError('flight-history-stats-api', error, { operation: "GET" });
    return handleApiError(error);
  }
}