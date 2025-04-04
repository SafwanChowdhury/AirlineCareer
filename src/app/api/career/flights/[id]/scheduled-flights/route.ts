import { NextResponse } from 'next/server';
import { getPilotById, getSchedulesByPilotId } from '@/lib/career-db';
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { scheduledFlights, routeDetails, schedules } from "@/lib/schema";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = parseInt(params.id, 10);
    
    if (isNaN(pilotId)) {
      return NextResponse.json(
        { error: "Invalid pilot ID" },
        { status: 400 }
      );
    }

    // Check if pilot exists first
    const pilot = await getPilotById(pilotId);
    if (!pilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    // Get all schedules for this pilot
    const pilotSchedules = await getSchedulesByPilotId(pilotId);
    
    if (!pilotSchedules.length) {
      return NextResponse.json([]);
    }

    // Get all scheduled flights for all schedules
    const scheduleIds = pilotSchedules.map(schedule => schedule.id);
    
    const flights = await db.select({
      flight: scheduledFlights,
      route: routeDetails,
      schedule: schedules
    })
    .from(scheduledFlights)
    .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.routeId))
    .innerJoin(schedules, eq(scheduledFlights.scheduleId, schedules.id))
    .where(
      and(
        // Only get flights for this pilot's schedules
        schedules.pilotId.in(scheduleIds.map(id => id.toString())),
        // Only get active flights (not completed or cancelled)
        scheduledFlights.status.notIn(['completed', 'cancelled'])
      )
    )
    .orderBy(scheduledFlights.departureTime);

    // Transform to expected format
    const formattedFlights = flights.map(({ flight, route, schedule }) => ({
      id: flight.id,
      scheduleId: flight.scheduleId,
      routeId: flight.routeId,
      sequenceOrder: flight.sequenceOrder,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      status: flight.status,
      
      // Route details
      departureIata: route.departureIata,
      departureCity: route.departureCity,
      departureCountry: route.departureCountry,
      arrivalIata: route.arrivalIata,
      arrivalCity: route.arrivalCity,
      arrivalCountry: route.arrivalCountry,
      distanceKm: route.distanceKm,
      durationMin: route.durationMin,
      airlineIata: route.airlineIata,
      airlineName: route.airlineName,
      
      // Schedule details
      scheduleName: schedule.name,
      pilot_id: pilotId
    }));

    return NextResponse.json(formattedFlights);
  } catch (error) {
    console.error("Error fetching scheduled flights:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled flights" },
      { status: 500 }
    );
  }
}