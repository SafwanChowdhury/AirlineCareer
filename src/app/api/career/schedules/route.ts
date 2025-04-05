import { NextResponse } from 'next/server';
import {
  createSchedule,
  getSchedulesByPilotId,
  getPilotProfileById
} from '@/lib/career-db';
import { db } from "@/lib/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { airports, schedules } from "@/lib/schema";
import type { Schedule } from "@/lib/types";

const scheduleInputSchema = z.object({
  name: z.string(),
  startLocation: z.string(),
  durationDays: z.number(),
  haulPreferences: z.string(),
  pilotId: z.string()
});

type ScheduleInput = z.infer<typeof scheduleInputSchema>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = scheduleInputSchema.parse(body) as ScheduleInput;

    // Validate airport codes
    const startAirport = await db.query.airports.findFirst({
      where: eq(airports.iataCode, validatedData.startLocation)
    });

    const endAirport = await db.query.airports.findFirst({
      where: eq(airports.iataCode, validatedData.endLocation)
    });

    if (!startAirport || !endAirport) {
      throw new Error("Invalid airport codes provided");
    }

    // Create schedule
    const [newSchedule] = await db.insert(schedules).values({
      name: validatedData.name,
      startLocation: validatedData.startLocation,
      durationDays: validatedData.durationDays,
      haulPreferences: validatedData.haulPreferences,
      pilotId: validatedData.pilotId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning() as Schedule[];

    return NextResponse.json({ id: newSchedule.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", details: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pilotId = searchParams.get('pilotId');

    if (!pilotId) {
      return NextResponse.json(
        { error: 'Pilot ID is required' },
        { status: 400 }
      );
    }

    const pilot = await getPilotProfileById(parseInt(pilotId, 10));
    if (!pilot) {
      return NextResponse.json(
        { error: 'Pilot not found' },
        { status: 404 }
      );
    }

    const schedules = await getSchedulesByPilotId(parseInt(pilotId, 10));
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
} 