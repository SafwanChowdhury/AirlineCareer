// src/app/api/career/schedules/[id]/route.ts
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";
import { z } from "zod";
import { 
  handleApiError, 
  successResponse,
  noContentResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

// Validation schema for schedule updates
const scheduleUpdateSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  startLocation: z.string().length(3, "Start location must be a 3-letter IATA code"),
  durationDays: z.number().int().min(1).max(30),
  haulPreferences: z.string()
});

/**
 * GET handler for retrieving a specific schedule
 * Returns the schedule if found
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const scheduleId = validateId(params.id);
    
    // Query the schedule
    const schedule = await db.query.schedules.findFirst({
      where: eq(schedules.id, scheduleId),
    });
    
    // Check if schedule exists
    if (!schedule) {
      throw new ApiError('Schedule not found', 404, { scheduleId });
    }
    
    // Return the schedule
    return successResponse(schedule, {
      message: `Retrieved schedule: ${schedule.name}`
    });
  } catch (error) {
    logApiError('schedule-id-api', error, { 
      operation: "GET", 
      id: params.id 
    });
    return handleApiError(error);
  }
}

/**
 * PUT handler for updating a schedule
 * Updates the schedule with new data
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const scheduleId = validateId(params.id);
    
    // Parse request body
    const body = await request.json();
    
    // Validate the input data
    const validationResult = scheduleUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(
        'Invalid input data', 
        400, 
        validationResult.error.errors
      );
    }
    
    const validatedData = validationResult.data;
    
    // Update the schedule
    const [updatedSchedule] = await db
      .update(schedules)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schedules.id, scheduleId))
      .returning();
    
    // Check if schedule was found and updated
    if (!updatedSchedule) {
      throw new ApiError('Schedule not found', 404, { scheduleId });
    }
    
    // Return the updated schedule
    return successResponse(updatedSchedule, {
      message: `Schedule "${updatedSchedule.name}" updated successfully`
    });
  } catch (error) {
    logApiError('schedule-id-api', error, { 
      operation: "PUT", 
      id: params.id 
    });
    return handleApiError(error);
  }
}

/**
 * DELETE handler for removing a schedule
 * Deletes the schedule with the specified ID
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate and parse ID parameter
    const scheduleId = validateId(params.id);
    
    // Delete the schedule
    const [deletedSchedule] = await db
      .delete(schedules)
      .where(eq(schedules.id, scheduleId))
      .returning();
    
    // Check if schedule was found and deleted
    if (!deletedSchedule) {
      throw new ApiError('Schedule not found', 404, { scheduleId });
    }
    
    // Return success with no content
    return noContentResponse();
  } catch (error) {
    logApiError('schedule-id-api', error, { 
      operation: "DELETE", 
      id: params.id 
    });
    return handleApiError(error);
  }
}