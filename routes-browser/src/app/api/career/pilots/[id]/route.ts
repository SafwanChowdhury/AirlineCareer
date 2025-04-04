import { NextResponse } from 'next/server';
import {
  getPilotProfileById,
  updatePilotProfile
} from '@/lib/career-db';
import { db } from "@/lib/db";
import { PilotProfile } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = parseInt(params.id);
    if (isNaN(pilotId)) {
      return NextResponse.json(
        { error: "Invalid pilot ID" },
        { status: 400 }
      );
    }

    const pilot = db.prepare(`
      SELECT 
        pilot_id,
        name,
        home_base,
        current_location,
        preferred_airline,
        created_at
      FROM pilots
      WHERE pilot_id = ?
    `).get(pilotId) as PilotProfile | undefined;

    if (!pilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pilot);
  } catch (error) {
    console.error("Error fetching pilot profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    await updatePilotProfile(pilotId, body);

    const updatedProfile = await getPilotProfileById(pilotId);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating pilot profile:', error);
    return NextResponse.json(
      { error: 'Failed to update pilot profile' },
      { status: 500 }
    );
  }
} 