import { NextResponse } from 'next/server';
import {
  createSchedule,
  addFlightToSchedule,
  getPilotProfileById
} from '@/lib/career-db';
import { generateSchedule } from '@/lib/schedule-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pilotId,
      name,
      startLocation,
      durationDays,
      airline,
      preferences
    } = body;

    if (!pilotId || !name || !durationDays || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify pilot exists and get their current location and home base
    const pilot = await getPilotProfileById(pilotId);
    if (!pilot) {
      return NextResponse.json(
        { error: 'Pilot not found' },
        { status: 404 }
      );
    }

    try {
      // Use provided start location or pilot's current location
      const actualStartLocation = startLocation || pilot.current_location;

      // Generate the schedule
      const generatedFlights = await generateSchedule(
        actualStartLocation,
        durationDays,
        airline,
        preferences,
        pilot.home_base
      );

      // Create the schedule
      const scheduleId = await createSchedule(
        pilotId,
        name,
        actualStartLocation,
        pilot.home_base, // End location is always home base
        durationDays,
        JSON.stringify(preferences)
      );

      // Add flights to the schedule
      for (let i = 0; i < generatedFlights.length; i++) {
        const flight = generatedFlights[i];
        await addFlightToSchedule(
          scheduleId,
          flight.route_id,
          i + 1,
          flight.departure_time,
          flight.arrival_time
        );
      }

      return NextResponse.json({
        scheduleId,
        flightCount: generatedFlights.length
      }, { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to generate schedule' },
      { status: 500 }
    );
  }
} 