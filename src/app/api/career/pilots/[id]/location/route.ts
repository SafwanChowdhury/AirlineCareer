// src/app/api/career/pilots/[id]/location/route.ts
import { 
  getPilotProfileById,
  updatePilotLocation
} from '@/lib/career-db';
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  validateRequiredFields,
  logApiError 
} from '@/lib/api-utils';

/**
 * PATCH handler for updating a pilot's location
 * Updates only the location field of the pilot profile
 */
export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Validate and parse the pilot ID
    const pilotId = validateId(context.params.id);
    
    // Check if pilot exists
    const profile = await getPilotProfileById(pilotId);
    
    if (!profile) {
      throw new ApiError('Pilot profile not found', 404);
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    validateRequiredFields(body, ['newLocation']);
    
    const { newLocation } = body;
    
    // Validate location format (IATA code - 3 uppercase letters)
    if (!/^[A-Z]{3}$/.test(newLocation)) {
      throw new ApiError(
        'Invalid location format. Expected 3-letter IATA code.', 
        400, 
        { providedLocation: newLocation }
      );
    }
    
    // Update the location
    await updatePilotLocation(pilotId, newLocation);
    
    // Get the updated profile
    const updatedProfile = await getPilotProfileById(pilotId);
    
    // Return the updated profile
    return successResponse(updatedProfile, {
      message: `Pilot location updated to ${newLocation}`
    });
  } catch (error) {
    logApiError('pilot-location-api', error, { 
      operation: "PATCH", 
      id: context.params.id 
    });
    return handleApiError(error);
  }
}