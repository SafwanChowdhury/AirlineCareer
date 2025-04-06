// src/app/api/career/flights/[id]/status/route.ts
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { scheduledFlights } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  validateRequiredFields,
  logApiError 
} from '@/lib/api-utils';

// Validation schema for status updates
const statusUpdateSchema = z.object({
  status: z.enum([
    'scheduled', 
    'in_progress', 
    'completed', 
    'cancelled'
  ], {
    errorMap: () => ({ message: 'Status must be one of: scheduled, in_progress, completed, cancelled' })
  })
});

/**
 * PUT handler for updating a flight's status
 * Updates the status of a specific scheduled flight
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse flight ID
    const flightId = validateId(params.id);
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    validateRequiredFields(body, ['status']);
    
    // Validate status value
    const validationResult = statusUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(
        'Invalid status value', 
        400, 
        validationResult.error.errors
      );
    }
    
    const { status } = validationResult.data;
    
    // Update the flight status
    const [updatedFlight] = await db
      .update(scheduledFlights)
      .set({ status })
      .where(eq(scheduledFlights.id, flightId))
      .returning();
    
    // Check if flight was found and updated
    if (!updatedFlight) {
      throw new ApiError('Flight not found', 404, { flightId });
    }
    
    // Return the updated flight
    return successResponse(updatedFlight, {
      message: `Flight status updated to: ${status}`
    });
  } catch (error) {
    logApiError('flight-status-api', error, { 
      operation: "PUT", 
      id: params.id 
    });
    return handleApiError(error);
  }
}

// Use dynamic rendering for this API route to always fetch the latest data
export const dynamic = 'force-dynamic';