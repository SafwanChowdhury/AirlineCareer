import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";
import { sql } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const pilotId = parseInt(id, 10);

    // For now, return mock statistics since we haven't implemented flight tracking yet
    const mockStats = {
      totalFlights: 0,
      totalDistance: 0,
      totalHours: 0,
      favoriteAirline: "",
      mostVisitedAirport: ""
    };

    // Get the pilot's schedules count
    const schedulesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schedules)
      .where(eq(schedules.pilotId, pilotId.toString()))
      .then(result => result[0]?.count || 0);

    if (schedulesCount > 0) {
      mockStats.totalFlights = schedulesCount;
      mockStats.totalDistance = schedulesCount * 1000; // Mock average of 1000km per flight
      mockStats.totalHours = schedulesCount * 2; // Mock average of 2 hours per flight
    }

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error("Error fetching pilot statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch pilot statistics" },
      { status: 500 }
    );
  }
} 