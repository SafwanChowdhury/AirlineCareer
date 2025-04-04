import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";

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

    const flights = await db
      .select()
      .from(schedules)
      .where(eq(schedules.pilotId, pilotId.toString()))
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