import { NextResponse } from 'next/server';
import {
  getPilotProfileById,
  updatePilotLocation
} from '@/lib/career-db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = parseInt(params.id, 10);
    if (isNaN(pilotId)) {
      return NextResponse.json(
        { error: 'Invalid pilot ID' },
        { status: 400 }
      );
    }

    const profile = await getPilotProfileById(pilotId);
    if (!profile) {
      return NextResponse.json(
        { error: 'Pilot profile not found' },
        { status: 404 }
      );
    }

    const { newLocation } = await request.json();
    if (!newLocation) {
      return NextResponse.json(
        { error: 'New location is required' },
        { status: 400 }
      );
    }

    await updatePilotLocation(pilotId, newLocation);
    const updatedProfile = await getPilotProfileById(pilotId);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating pilot location:', error);
    return NextResponse.json(
      { error: 'Failed to update pilot location' },
      { status: 500 }
    );
  }
} 