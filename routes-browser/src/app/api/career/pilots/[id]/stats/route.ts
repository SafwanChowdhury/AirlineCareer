import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FlightHistoryStats } from "@/lib/types";

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

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_flights,
        SUM(flight_duration_min) as total_minutes,
        COUNT(DISTINCT departure_location || arrival_location) as airports_visited,
        COUNT(DISTINCT airline_iata) as airlines_flown
      FROM flight_history
      WHERE pilot_id = ?
    `).get(pilotId) as FlightHistoryStats;

    if (!stats) {
      return NextResponse.json(
        { 
          total_flights: 0,
          total_minutes: 0,
          airports_visited: 0,
          airlines_flown: 0
        } as FlightHistoryStats
      );
    }

    // Convert null values to 0 for new pilots with no history
    stats.total_flights = stats.total_flights || 0;
    stats.total_minutes = stats.total_minutes || 0;
    stats.airports_visited = stats.airports_visited || 0;
    stats.airlines_flown = stats.airlines_flown || 0;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching flight history stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 