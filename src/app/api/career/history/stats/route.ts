import { NextResponse } from 'next/server';
import {
  getFlightHistoryStats,
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

    const stats = await getFlightHistoryStats(parseInt(pilotId, 10));
    if (!stats) {
      return NextResponse.json({
        total_flights: 0,
        total_minutes: 0,
        airports_visited: 0,
        airlines_flown: 0
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching flight history stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight history stats' },
      { status: 500 }
    );
  }
} 