import { NextResponse } from 'next/server';
import {
  getNextFlightForPilot,
  getPilotProfileById
} from '@/lib/career-db';

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

    const nextFlight = await getNextFlightForPilot(parseInt(pilotId, 10));
    if (!nextFlight) {
      return NextResponse.json(
        { message: 'No scheduled flights found' },
        { status: 404 }
      );
    }

    return NextResponse.json(nextFlight);
  } catch (error) {
    console.error('Error fetching next flight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next flight' },
      { status: 500 }
    );
  }
} 