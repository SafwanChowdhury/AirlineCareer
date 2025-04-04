import { NextResponse } from 'next/server';
import {
  getScheduleById,
  deleteSchedule,
  getFlightsByScheduleId
} from '@/lib/career-db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = parseInt(params.id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    const schedule = await getScheduleById(scheduleId);
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Get all flights in the schedule
    const flights = await getFlightsByScheduleId(scheduleId);

    return NextResponse.json({
      ...schedule,
      flights
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = parseInt(params.id, 10);
    if (isNaN(scheduleId)) {
      return NextResponse.json(
        { error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    const schedule = await getScheduleById(scheduleId);
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    await deleteSchedule(scheduleId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 