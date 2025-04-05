import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { validateId, handleApiError, ApiError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params before accessing them
    const params = await Promise.resolve(context.params);
    console.log("[pilot-stats] Request params:", params);
    
    const pilotId = validateId(params.id);
    console.log("[pilot-stats] Validated pilotId:", pilotId);

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
      .where(eq(schedules.pilotId, pilotId))
      .then(result => result[0]?.count || 0);
    
    console.log("[pilot-stats] Found schedules:", schedulesCount);

    if (schedulesCount > 0) {
      mockStats.totalFlights = schedulesCount;
      mockStats.totalDistance = schedulesCount * 1000; // Mock average of 1000km per flight
      mockStats.totalHours = schedulesCount * 2; // Mock average of 2 hours per flight
    }

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error("[pilot-stats] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return handleApiError(error);
  }
} 