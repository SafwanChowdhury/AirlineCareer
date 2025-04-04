import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
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
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const pilotId = parseInt(id, 10);
    
    if (isNaN(pilotId)) {
      return NextResponse.json(
        { error: "Invalid pilot ID" },
        { status: 400 }
      );
    }

    const pilot = await db
      .select()
      .from(pilots)
      .where(eq(pilots.id, pilotId))
      .limit(1);

    if (!pilot || pilot.length === 0) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pilot[0]);
  } catch (err) {
    console.error("Error fetching pilot:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const pilotId = parseInt(id, 10);
    const body = await request.json();
    const validatedData = pilotUpdateSchema.parse(body);

    const [updatedPilot] = await db
      .update(pilots)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pilots.id, pilotId))
      .returning();

    if (!updatedPilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPilot);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: err.errors },
        { status: 400 }
      );
    }

    console.error("Error updating pilot:", err);
    return NextResponse.json(
      { error: "Failed to update pilot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const pilotId = parseInt(id, 10);

    const [deletedPilot] = await db
      .delete(pilots)
      .where(eq(pilots.id, pilotId))
      .returning();

    if (!deletedPilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error deleting pilot:", err);
    return NextResponse.json(
      { error: "Failed to delete pilot" },
      { status: 500 }
    );
  }
} 