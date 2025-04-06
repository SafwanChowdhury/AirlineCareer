// src/app/api/career/pilots/[id]/scheduled-flights/route.ts
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules, pilots } from "@/lib/schema";
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for retrieving a pilot's scheduled flights
 * Returns all schedules for a specific pilot
 */
export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    // Validate and parse the pilot ID
    const pilotId = validateId(context.params.id);
    
    // Check if the pilot exists
    const pilot = await db
      .select()
      .from(pilots)
      .where(eq(pilots.id, pilotId))
      .get();
    
    if (!pilot) {
      throw new ApiError("Pilot not found", 404, { pilotId });
    }
    
    // Get all schedules for the pilot
    const flights = await db
      .select()
      .from(schedules)
      .where(eq(schedules.pilotId, pilotId))
      .orderBy(schedules.createdAt);
    
    return successResponse(flights, {
      message: `Retrieved ${flights.length} scheduled flights for pilot ID: ${pilotId}`
    });
  } catch (error) {
    logApiError('scheduled-flights-api', error, { 
      operation: "GET", 
      id: context.params.id 
    });
    return handleApiError(error);
  }
}