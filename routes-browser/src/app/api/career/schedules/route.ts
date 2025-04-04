import { NextResponse } from 'next/server';
import {
  createSchedule,
  getSchedulesByPilotId,
  getPilotProfileById
} from '@/lib/career-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      pilotId,
      name,
      startLocation,
      endLocation,
      durationDays,
      preferences
    } = body;

    if (!pilotId || !name || !startLocation || !endLocation || !durationDays) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify pilot exists
    const pilot = await getPilotProfileById(pilotId);
    if (!pilot) {
      return NextResponse.json(
        { error: 'Pilot not found' },
        { status: 404 }
      );
    }

    const scheduleId = await createSchedule(
      pilotId,
      name,
      startLocation,
      endLocation,
      durationDays,
      JSON.stringify(preferences || {})
    );

    return NextResponse.json({ scheduleId }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
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