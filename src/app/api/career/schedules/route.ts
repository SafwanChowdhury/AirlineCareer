// src/app/api/career/schedules/route.ts
import { 
  createSchedule,
  getSchedulesByPilotId,
  getPilotProfileById
} from '@/lib/career-db';
import { routesDb } from "@/lib/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { airports } from "@/lib/routes-schema";
import { 
  handleApiError, 
  successResponse,
  createdResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

// Validation schema for schedule inputs
const scheduleInputSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  startLocation: z.string().length(3, "Start location must be a 3-letter IATA code"),
  endLocation: z.string().length(3, "End location must be a 3-letter IATA code").optional(),
  durationDays: z.number().int().min(1).max(30),
  haulPreferences: z.string(),
  pilotId: z.string().or(z.number())
});

/**
 * POST handler for creating a new schedule
 * Creates a new schedule for a pilot
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input data against schema
    const validationResult = scheduleInputSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(
        'Invalid input data', 
        400, 
        validationResult.error.errors
      );
    }
    
    const validatedData = validationResult.data;
    const pilotId = validateId(validatedData.pilotId);
    
    // Validate airport codes using the routesDb (for airports)
    const startAirport = await routesDb.select()
      .from(airports)
      .where(eq(airports.iata, validatedData.startLocation))
      .limit(1);
    
    if (!startAirport.length) {
      throw new ApiError(
        "Invalid start airport code", 
        400, 
        { startLocation: validatedData.startLocation }
      );
    }
    
    // If end location is provided, validate it too
    if (validatedData.endLocation) {
      const endAirport = await routesDb.select()
        .from(airports)
        .where(eq(airports.iata, validatedData.endLocation))
        .limit(1);
      
      if (!endAirport.length) {
        throw new ApiError(
          "Invalid end airport code", 
          400, 
          { endLocation: validatedData.endLocation }
        );
      }
    }
    
    // Create the schedule using the helper function
    const newSchedule = await createSchedule({
      pilotId,
      name: validatedData.name,
      startLocation: validatedData.startLocation,
      durationDays: validatedData.durationDays,
      haulPreferences: validatedData.haulPreferences
    });
    
    // Return the created schedule
    return createdResponse(newSchedule, {
      message: `Schedule "${newSchedule.name}" created successfully`
    });
  } catch (error) {
    logApiError('schedules-api', error, { operation: "POST" });
    return handleApiError(error);
  }
}

/**
 * GET handler for retrieving schedules
 * Gets all schedules for a specific pilot
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get('pilotId');
    
    if (!pilotIdParam) {
      throw new ApiError('Pilot ID is required', 400);
    }
    
    const pilotId = validateId(pilotIdParam);
    
    // Check if pilot exists using the helper function
    const pilot = await getPilotProfileById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404, { pilotId });
    }
    
    // Get all schedules for the pilot using the helper function
    const scheduleList = await getSchedulesByPilotId(pilotId);
    
    return successResponse(scheduleList, {
      message: `Retrieved ${scheduleList.length} schedules for pilot: ${pilot.name}`
    });
  } catch (error) {
    logApiError('schedules-api', error, { operation: "GET" });
    return handleApiError(error);
  }
}