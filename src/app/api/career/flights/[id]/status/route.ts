import { NextResponse } from 'next/server';
import { updateFlightStatus } from '@/lib/career-db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = parseInt(params.id);
    if (isNaN(flightId)) {
      return NextResponse.json(
        { error: 'Invalid flight ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Call the career-db function that handles transactions
    const updatedFlight = await updateFlightStatus(flightId, status);
    
    if (!updatedFlight) {
      return NextResponse.json(
        { error: 'Flight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFlight);
  } catch (error) {
    console.error('Error updating flight status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}