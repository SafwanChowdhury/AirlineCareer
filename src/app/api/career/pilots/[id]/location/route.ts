import { NextResponse } from 'next/server';
import {
  getPilotProfileById,
  updatePilotLocation
} from '@/lib/career-db';
import { validateId, handleApiError, ApiError } from '@/lib/api-utils';

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params before accessing them
    const params = await Promise.resolve(context.params);
    console.log("[pilot-location] Request params:", params);
    
    console.log("[pilot-location] Raw ID from params:", params.id);
    const pilotId = validateId(params.id);
    console.log("[pilot-location] Validated pilotId:", pilotId);
    
    const profile = await getPilotProfileById(pilotId);
    console.log("[pilot-location] Initial profile lookup:", profile ? "found" : "not found");

    if (!profile) {
      console.log("[pilot-location] Profile not found for ID:", pilotId);
      throw new ApiError('Pilot profile not found', 404);
    }

    const body = await request.json();
    console.log("[pilot-location] Request body:", body);
    const { newLocation } = body;
    
    if (!newLocation) {
      console.log("[pilot-location] Missing newLocation in request body");
      throw new ApiError('New location is required', 400);
    }

    await updatePilotLocation(pilotId, newLocation);
    console.log("[pilot-location] Location updated successfully");
    
    const updatedProfile = await getPilotProfileById(pilotId);
    console.log("[pilot-location] Updated profile:", updatedProfile);
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[pilot-location] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return handleApiError(error);
  }
} 