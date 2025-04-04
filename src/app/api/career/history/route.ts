import { NextResponse } from 'next/server';
import {
  getFlightHistoryByPilotId,
  getPilotProfileById
} from '@/lib/career-db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pilotId = searchParams.get('pilotId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

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

    const history = await getFlightHistoryByPilotId(
      parseInt(pilotId, 10),
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching flight history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight history' },
      { status: 500 }
    );
  }
} 