import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { schedules } from "@/lib/schema";
import { z } from "zod";

const scheduleUpdateSchema = z.object({
  name: z.string(),
  startLocation: z.string(),
  endLocation: z.string(),
  durationDays: z.number(),
  haulPreferences: z.string(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const schedule = await db.query.schedules.findFirst({
      where: eq(schedules.id, parseInt(params.id, 10)),
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
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
    const validatedData = scheduleUpdateSchema.parse(body);

    const [updatedSchedule] = await db
      .update(schedules)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schedules.id, parseInt(params.id, 10)))
      .returning();

    if (!updatedSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedSchedule] = await db
      .delete(schedules)
      .where(eq(schedules.id, parseInt(params.id, 10)))
      .returning();

    if (!deletedSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 