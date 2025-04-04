import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ScheduledFlightWithRoute } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = parseInt(params.id);
    if (isNaN(pilotId)) {
      return NextResponse.json(
        { error: "Invalid pilot ID" },
        { status: 400 }
      );
    }

    const flights = db.prepare(`
      SELECT 
        sf.scheduled_flight_id,
        sf.schedule_id,
        sf.route_id,
        sf.sequence_order,
        sf.departure_time,
        sf.arrival_time,
        sf.status,
        s.name as schedule_name,
        s.pilot_id,
        rd.departure_iata,
        rd.departure_city,
        rd.departure_country,
        rd.arrival_iata,
        rd.arrival_city,
        rd.arrival_country,
        rd.distance_km,
        rd.duration_min,
        rd.airline_iata,
        rd.airline_name
      FROM scheduled_flights sf
      JOIN schedules s ON sf.schedule_id = s.schedule_id
      JOIN route_details rd ON sf.route_id = rd.route_id
      WHERE s.pilot_id = ?
      ORDER BY sf.departure_time ASC
    `).all(pilotId) as ScheduledFlightWithRoute[];

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Error fetching scheduled flights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 