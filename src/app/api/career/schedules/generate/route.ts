import { NextRequest } from 'next/server';
import { generateSchedule } from '@/lib/schedule-generator';
import { createSchedule, addFlightToSchedule } from '@/lib/career-db';
import { handleApiError, successResponse, validateParams, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const scheduleRequestSchema = z.object({
  pilotId: z.number(),
  name: z.string(),
  startLocation: z.string(),
  endLocation: z.string(),
  durationDays: z.number().min(1).max(30),
  haulPreferences: z.enum(['short', 'medium', 'long', 'any']).optional(),
  preferredAirline: z.string().optional(),
  maxLayoverHours: z.number().min(1).max(12).optional()
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const validated = scheduleRequestSchema.parse(data);

    // Generate route sequence
    const routes = await generateSchedule({
      startLocation: validated.startLocation,
      endLocation: validated.endLocation,
      durationDays: validated.durationDays,
      haulPreferences: validated.haulPreferences,
      preferredAirline: validated.preferredAirline,
      maxLayoverHours: validated.maxLayoverHours
    });

    if (routes.length === 0) {
      throw new ApiError('No valid routes found for the given criteria');
    }

    // Create schedule
    const schedule = await createSchedule({
      pilotId: validated.pilotId,
      name: validated.name,
      startLocation: validated.startLocation,
      endLocation: validated.endLocation,
      durationDays: validated.durationDays,
      haulPreferences: validated.haulPreferences
    });

    // Calculate flight times and add flights to schedule
    let currentTime = new Date();
    const flights = await Promise.all(
      routes.map(async (route, index) => {
        const departureTime = new Date(currentTime);
        const arrivalTime = new Date(currentTime.getTime() + route.durationMin * 60 * 1000);
        
        // Add 2 hours layover between flights
        currentTime = new Date(arrivalTime.getTime() + 120 * 60 * 1000);

        return addFlightToSchedule({
          scheduleId: schedule.id,
          routeId: route.routeId,
          sequenceOrder: index,
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString()
        });
      })
    );

    return successResponse({ schedule, flights });
  } catch (error) {
    return handleApiError(error);
  }
} 