import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules, pilots } from "@/lib/schema";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    // Check if pilot exists first
    const pilot = await db
      .select()
      .from(pilots)
      .where(eq(pilots.id, parseInt(id)))
      .get();

    if (!pilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    const flights = await db
      .select()
      .from(schedules)
      .where(eq(schedules.pilotId, id))
      .orderBy(schedules.createdAt);

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Error fetching scheduled flights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 