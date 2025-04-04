import { NextRequest } from 'next/server';
import { getPilotById, updatePilot } from '@/lib/career-db';
import { handleApiError, successResponse, validateId, validateParams, ApiError } from '@/lib/api-utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = validateId(params.id);
    const pilot = await getPilotById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }
    
    return successResponse(pilot);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pilotId = validateId(params.id);
    const data = await request.json();
    
    validateParams(data, ['name', 'homeBase', 'currentLocation']);
    
    const pilot = await getPilotById(pilotId);
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }
    
    const updatedPilot = await updatePilot(pilotId, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    return successResponse(updatedPilot);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const pilotId = parseInt(context.params.id, 10);

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
  } catch (err) {
    console.error("Error deleting pilot:", err);
    return NextResponse.json(
      { error: "Failed to delete pilot" },
      { status: 500 }
    );
  }
} 