import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules, pilots } from "@/lib/schema";
import { validateId, handleApiError, ApiError } from "@/lib/api-utils";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Ensure we await the params
    const params = await Promise.resolve(context.params);
    console.log("[scheduled-flights] Request params:", params);
    
    if (!params.id) {
      throw new ApiError("Missing pilot ID", 400);
    }

    console.log("[scheduled-flights] Raw ID from params:", params.id);
    const pilotId = validateId(params.id);
    
    console.log("[scheduled-flights] Validated pilotId:", pilotId);
    
    // Check if pilot exists first
    const pilot = await db
      .select()
      .from(pilots)
      .where(eq(pilots.id, pilotId))
      .get();

    console.log("[scheduled-flights] Pilot lookup result:", pilot);

    if (!pilot) {
      console.log("[scheduled-flights] Pilot not found for ID:", pilotId);
      throw new ApiError("Pilot not found", 404);
    }

    const flights = await db
      .select()
      .from(schedules)
      .where(eq(schedules.pilotId, pilotId))
      .orderBy(schedules.createdAt);

    console.log("[scheduled-flights] Found flights:", flights?.length || 0);
    return NextResponse.json(flights);
  } catch (error) {
    console.error("[scheduled-flights] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return handleApiError(error);
  }
} 