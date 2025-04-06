// src/app/api/career/schedules/generate/route.ts
import { generateSchedule } from '@/lib/schedule-generator';
import { 
  createSchedule, 
  addFlightToSchedule, 
  getPilotProfileById 
} from '@/lib/career-db';
import { z } from 'zod';
import { 
  handleApiError, 
  successResponse,
  ApiError, 
  validateId,
  logApiError 
} from '@/lib/api-utils';

// Validation schema for schedule generation requests
const scheduleRequestSchema = z.object({
  pilotId: z.number().positive('Pilot ID must be a positive number')
    .or(z.string().transform(val => parseInt(val, 10))),
  name: z.string().min(1, 'Schedule name is required'),
  startLocation: z.string().length(3, 'Start location must be a 3-letter IATA code'),
  durationDays: z.number().min(1).max(30),
  haulPreferences: z.enum(['short', 'medium', 'long', 'any']).optional()
    .default('any'),
  preferredAirline: z.string().optional(),
  maxLayoverHours: z.number().min(1).max(12).optional()
    .default(4)
});

/**
 * POST handler for generating a new schedule
 * Creates a schedule with auto-generated flights based on parameters
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate the input data
    const validationResult = scheduleRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ApiError(
        'Invalid request data', 
        400, 
        validationResult.error.errors
      );
    }
    
    const validatedData = validationResult.data;
    
    // Convert string pilotId to number if needed and validate
    const pilotId = validateId(validatedData.pilotId);
    
    // Verify pilot exists
    const pilot = await getPilotProfileById(pilotId);
    if (!pilot) {
      throw new ApiError('Pilot not found', 404, { pilotId });
    }
    
    // Extract schedule generation parameters
    const { 
      name, 
      startLocation, 
      durationDays, 
      haulPreferences, 
      preferredAirline,
      maxLayoverHours
    } = validatedData;
    
    // Generate flight routes for the schedule
    const routes = await generateSchedule({
      startLocation,
      durationDays,
      haulPreferences,
      preferredAirline,
      maxLayoverHours
    });
    
    // Handle case when no routes were generated
    if (!routes || routes.length === 0) {
      throw new ApiError(
        'No routes found matching the criteria', 
        404, 
        { startLocation, haulPreferences, preferredAirline }
      );
    }
    
    // Create the schedule record
    const schedule = await createSchedule({
      pilotId,
      name,
      startLocation,
      durationDays,
      haulPreferences
    });
    
    // Add the generated routes to the schedule
    const scheduledFlights = [];
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const flight = await addFlightToSchedule({
        scheduleId: schedule.id,
        routeId: route.routeId,
        sequenceOrder: i + 1,
        departureTime: new Date().toISOString(), // This would need proper datetime calculation
        arrivalTime: new Date().toISOString()  // This would need proper datetime calculation
      });
      scheduledFlights.push(flight);
    }
    
    // Return the created schedule with its flights
    return successResponse(
      {
        schedule,
        flights: scheduledFlights,
        routeCount: routes.length
      },
      {
        message: `Schedule "${name}" created with ${routes.length} flights`
      }
    );
  } catch (error) {
    logApiError('schedule-generate-api', error, { operation: "POST" });
    return handleApiError(error);
  }
}