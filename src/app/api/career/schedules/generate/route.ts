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
    const { pilotId, name, startLocation, durationDays, haulPreferences } = await request.json();

    // Validate required fields
    if (!pilotId || !name || !startLocation || !durationDays) {
      throw new ApiError('Missing required fields', 400);
    }

    // Verify pilot exists
    const pilot = await getPilotProfileById(pilotId);
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }

    // Create the schedule
    const schedule = await createSchedule({
      pilotId,
      name,
      startLocation,
      durationDays,
      haulPreferences
    });

    return NextResponse.json(schedule);
  } catch (error) {
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