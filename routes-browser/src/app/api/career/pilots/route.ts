import { NextResponse } from 'next/server';
import { createPilotProfile, getPilotProfiles } from '@/lib/career-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, homeBase, currentLocation, preferredAirline } = body;

    if (!name || !homeBase || !currentLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pilotId = await createPilotProfile(
      name,
      homeBase,
      currentLocation,
      preferredAirline
    );

    return NextResponse.json({ pilotId }, { status: 201 });
  } catch (error) {
    console.error('Error creating pilot profile:', error);
    return NextResponse.json(
      { error: 'Failed to create pilot profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const profiles = await getPilotProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error('Error fetching pilot profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pilot profiles' },
      { status: 500 }
    );
  }
} 