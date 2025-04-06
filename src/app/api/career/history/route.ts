// src/app/api/career/history/route.ts
import {
  getFlightHistoryByPilotId,
  getPilotProfileById
} from '@/lib/career-db';
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  PaginationInfo,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for retrieving a pilot's flight history
 * Returns flight history for a specific pilot with optional pagination
 */
export async function GET(request: Request) {
  try {
    // Get parameters from the URL
    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get('pilotId');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // Validate required parameters
    if (!pilotIdParam) {
      throw new ApiError('Pilot ID is required', 400);
    }
    
    // Parse and validate the pilot ID
    const pilotId = validateId(pilotIdParam);
    
    // Parse pagination parameters
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;
    
    // Check if the pilot exists
    const pilot = await getPilotProfileById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404, { pilotId });
    }
    
    // Get the flight history with the specified parameters
    const history = await getFlightHistoryByPilotId(
      pilotId,
      limit,
      offset
    );
    
    // Create pagination information if applicable
    let pagination: PaginationInfo | undefined;
    if (limit) {
      // This is a simplified example - in a real app, you would need to
      // query for the total count separately
      pagination = {
        totalCount: history.length, // This should ideally be a separate count query
        currentPage: offset ? Math.floor(offset / limit) + 1 : 1,
        totalPages: 1, // This should be calculated from the total count
        limit
      };
    }
    
    // Return the flight history
    return successResponse(history, {
      message: `Retrieved ${history.length} flight history records for pilot: ${pilot.name}`,
      pagination
    });
  } catch (error) {
    logApiError('flight-history-api', error, { operation: "GET" });
    return handleApiError(error);
  }
}