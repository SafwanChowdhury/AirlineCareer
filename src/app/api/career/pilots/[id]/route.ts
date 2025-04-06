// src/app/api/career/pilots/[id]/route.ts
import { NextRequest } from 'next/server';
import { db } from "@/lib/db";
import { pilots } from "@/lib/schema";
import { eq } from 'drizzle-orm';
import { 
  handleApiError, 
  successResponse, 
  noContentResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for retrieving a specific pilot by ID
 * Returns the pilot profile if found
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const pilotId = validateId(params.id);
    
    // Query the database for the pilot
    const pilot = await db.query.pilots.findFirst({
      where: eq(pilots.id, pilotId),
    });
    
    // Check if pilot exists
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }
    
    // Return the pilot data
    return successResponse(pilot, {
      message: `Retrieved pilot: ${pilot.name}`
    });
  } catch (error) {
    logApiError('pilot-id-api', error, { operation: "GET", id: params.id });
    return handleApiError(error);
  }
}

/**
 * PUT handler for updating a pilot
 * Updates the pilot with the provided data
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const pilotId = validateId(params.id);
    
    // Parse request body
    const data = await request.json();
    
    // Update the pilot record with new timestamp
    const [updatedPilot] = await db
      .update(pilots)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pilots.id, pilotId))
      .returning();
    
    // Check if pilot was found and updated
    if (!updatedPilot) {
      throw new ApiError('Pilot not found', 404);
    }
    
    // Return the updated pilot
    return successResponse(updatedPilot, {
      message: `Pilot ${updatedPilot.name} updated successfully`
    });
  } catch (error) {
    logApiError('pilot-id-api', error, { operation: "PUT", id: params.id });
    return handleApiError(error);
  }
}

/**
 * DELETE handler for removing a pilot
 * Deletes the pilot with the specified ID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const pilotId = validateId(params.id);
    
    // Delete the pilot
    const [deletedPilot] = await db
      .delete(pilots)
      .where(eq(pilots.id, pilotId))
      .returning();
    
    // Check if pilot was found and deleted
    if (!deletedPilot) {
      throw new ApiError('Pilot not found', 404);
    }
    
    // Return 204 No Content for successful deletion
    return noContentResponse();
  } catch (error) {
    logApiError('pilot-id-api', error, { operation: "DELETE", id: params.id });
    return handleApiError(error);
  }
}