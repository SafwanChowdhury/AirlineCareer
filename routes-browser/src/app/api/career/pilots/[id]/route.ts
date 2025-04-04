import { NextResponse } from 'next/server';
import {
  getPilotProfileById,
  updatePilotProfile
} from '@/lib/career-db';
import { db } from "@/lib/db";
import { PilotProfile } from "@/lib/types";
import { eq } from "drizzle-orm";
import { pilots } from "@/lib/schema";
import { z } from "zod";

const pilotUpdateSchema = z.object({
  name: z.string(),
  homeBase: z.string(),
  currentLocation: z.string(),
  preferredAirline: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilot = await db.query.pilots.findFirst({
      where: eq(pilots.id, parseInt(params.id, 10)),
    });

    if (!pilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pilot);
  } catch (error) {
    console.error("Error fetching pilot:", error);
    return NextResponse.json(
      { error: "Failed to fetch pilot" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = pilotUpdateSchema.parse(body);

    const [updatedPilot] = await db
      .update(pilots)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pilots.id, parseInt(params.id, 10)))
      .returning();

    if (!updatedPilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPilot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating pilot:", error);
    return NextResponse.json(
      { error: "Failed to update pilot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedPilot] = await db
      .delete(pilots)
      .where(eq(pilots.id, parseInt(params.id, 10)))
      .returning();

    if (!deletedPilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting pilot:", error);
    return NextResponse.json(
      { error: "Failed to delete pilot" },
      { status: 500 }
    );
  }
} 