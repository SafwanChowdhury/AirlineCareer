// src/app/api/career/pilots/[id]/stats/route.ts
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { 
  handleApiError, 
  successResponse,
  validateId,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for retrieving pilot statistics
 * Returns flight statistics for a specific pilot
 */
export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    // Validate and parse the pilot ID
    const pilotId = validateId(context.params.id);
    
    // Get the pilot's schedules count
    const schedulesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schedules)
      .where(eq(schedules.pilotId, pilotId))
      .then(result => result[0]?.count || 0);
    
    // For now, return mock statistics using the schedules count
    // This can be expanded later to include real statistics from flight history
    const stats = {
      totalFlights: schedulesCount,
      totalDistance: schedulesCount > 0 ? schedulesCount * 1000 : 0, // Mock average of 1000km per flight
      totalHours: schedulesCount > 0 ? schedulesCount * 2 : 0, // Mock average of 2 hours per flight
      favoriteAirline: "",
      mostVisitedAirport: ""
    };
    
    return successResponse(stats, {
      message: `Retrieved flight statistics for pilot ID: ${pilotId}`
    });
  } catch (error) {
    logApiError('pilot-stats-api', error, { 
      operation: "GET", 
      id: context.params.id 
    });
    return handleApiError(error);
  }
}