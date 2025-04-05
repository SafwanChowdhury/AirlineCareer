import { NextRequest, NextResponse } from 'next/server';
import { getPilotProfileById, updatePilotLocation } from '@/lib/career-db';
import { handleApiError, successResponse, validateId, validateParams, ApiError } from '@/lib/api-utils';
import { db } from '@/lib/db';
import { pilots } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pilot = await getPilotProfileById(parseInt(params.id));
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }
    return NextResponse.json(pilot);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error fetching pilot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pilot' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { currentLocation } = await request.json();
    if (!currentLocation) {
      throw new ApiError('Current location is required', 400);
    }

    await updatePilotLocation(parseInt(params.id), currentLocation);
    return NextResponse.json({ message: 'Pilot location updated successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error updating pilot:', error);
    return NextResponse.json(
      { error: 'Failed to update pilot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure we await the params
    const params = await Promise.resolve(context.params);
    console.log("[pilot-api] Request params for DELETE:", params);
    
    const pilotId = validateId(params.id);
    
    const [deletedPilot] = await db
      .delete(pilots)
      .where(eq(pilots.id, pilotId))
      .returning();

    if (!deletedPilot) {
      return NextResponse.json(
        { error: "Pilot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
} 