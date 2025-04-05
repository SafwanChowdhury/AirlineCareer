import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { pilots } from "@/lib/schema";
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { createPilot } from '@/lib/career-db';

export async function GET() {
  try {
    console.log("[pilots-api] Fetching all pilots");
    const allPilots = await db.query.pilots.findMany({
      orderBy: (pilots, { asc }) => [asc(pilots.name)],
    });
    
    console.log(`[pilots-api] Found ${allPilots.length} pilots`);
    return successResponse(allPilots);
  } catch (error) {
    console.error("[pilots-api] Error fetching pilots:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.homeBase) {
      throw new ApiError('Name and home base are required', 400);
    }

    // Set current location to home base if not provided
    if (!data.currentLocation) {
      data.currentLocation = data.homeBase;
    }

    console.log('[pilots-api] Creating pilot:', data);
    const pilot = await createPilot(data);
    console.log('[pilots-api] Created pilot:', pilot);
    return successResponse(pilot);
  } catch (error) {
    console.error('[pilots-api] Error creating pilot:', error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Failed to create pilot' },
      { status: 500 }
    );
  }
} 