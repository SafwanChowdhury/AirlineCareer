// src/app/api/career/flights/next/route.ts
import { 
  getNextFlightForPilot,
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
 * GET handler for retrieving a pilot's next scheduled flight
 * Returns the next upcoming flight for a specific pilot
 */
export async function GET(request: Request) {
  try {
    // Get the pilot ID from the URL parameters
    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get('pilotId');
    
    if (!pilotIdParam) {
      throw new ApiError('Pilot ID is required', 400);
    }
    
    // Validate and parse pilot ID
    const pilotId = validateId(pilotIdParam);
    
    // Check if pilot exists
    const pilot = await getPilotProfileById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404, { pilotId });
    }
    
    // Get the next flight for the pilot
    const nextFlight = await getNextFlightForPilot(pilotId);
    
    // Handle case where no flights are scheduled
    if (!nextFlight) {
      return successResponse(null, {
        message: 'No scheduled flights found for this pilot',
        status: 404
      });
    }
    
    // Return the next flight
    return successResponse(nextFlight, {
      message: `Retrieved next scheduled flight for pilot: ${pilot.name}`
    });
  } catch (error) {
    logApiError('next-flight-api', error, { operation: "GET" });
    return handleApiError(error);
  }
}