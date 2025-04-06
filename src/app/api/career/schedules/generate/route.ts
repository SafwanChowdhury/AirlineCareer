import { NextRequest } from 'next/server';
import { generateSchedule } from '@/lib/schedule-generator';
import { createSchedule, addFlightToSchedule, getPilotProfileById } from '@/lib/career-db';
import { handleApiError, successResponse, validateParams, ApiError } from '@/lib/api-utils';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const scheduleRequestSchema = z.object({
  pilotId: z.number().positive('Pilot ID must be a positive number'),
  name: z.string().min(1, 'Schedule name is required'),
  startLocation: z.string().length(3, 'Start location must be a 3-letter IATA code'),
  durationDays: z.number().min(1).max(30),
  haulPreferences: z.enum(['short', 'medium', 'long', 'any']).optional(),
  preferredAirline: z.string().optional(),
  maxLayoverHours: z.number().min(1).max(12).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = scheduleRequestSchema.parse(body);
    const { pilotId, name, startLocation, durationDays, haulPreferences, preferredAirline } = validatedData;

    // Verify pilot exists
    const pilot = await getPilotProfileById(pilotId);
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }

    // Generate flight routes for the schedule
    const routes = await generateSchedule({
      startLocation,
      durationDays,
      haulPreferences,
      preferredAirline
    });

    // Create the schedule
    const schedule = await createSchedule({
      pilotId,
      name,
      startLocation,
      durationDays,
      haulPreferences
    });

    // Add the generated routes to the schedule
    for (const route of routes) {
      await addFlightToSchedule({
        scheduleId: schedule.id,
        routeId: route.id,
        sequenceOrder: route.sequenceOrder,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        schedule
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error generating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    );
  }
} 