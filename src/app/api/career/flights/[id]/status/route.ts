import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api-utils';
import { db } from '@/lib/db';
import { scheduledFlights } from '@/lib/career-schema';
import { eq } from 'drizzle-orm';

interface FlightDetails {
  scheduled_flight_id: number;
  schedule_id: number;
  route_id: number;
  pilot_id: number;
  departure_time: string;
  arrival_time: string;
  departure_iata: string;
  arrival_iata: string;
  airline_iata: string;
  duration_min: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!status || !['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw new ApiError('Invalid status', 400);
    }

    const result = await db.update(scheduledFlights)
      .set({ status })
      .where(eq(scheduledFlights.id, parseInt(params.id)))
      .returning();

    if (!result.length) {
      throw new ApiError('Flight not found', 404);
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error updating flight status:', error);
    return NextResponse.json(
      { error: 'Failed to update flight status' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 