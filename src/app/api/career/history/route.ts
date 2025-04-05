import { NextResponse } from 'next/server';
import {
  getFlightHistoryByPilotId,
  getPilotProfileById
} from '@/lib/career-db';
import { validateId, handleApiError, ApiError } from '@/lib/api-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get('pilotId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!pilotIdParam) {
      throw new ApiError('Pilot ID is required', 400);
    }

    const pilotId = validateId(pilotIdParam);
    const pilot = await getPilotProfileById(pilotId);
    
    if (!pilot) {
      throw new ApiError('Pilot not found', 404);
    }

    const history = await getFlightHistoryByPilotId(
      pilotId,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined
    );

    return NextResponse.json(history);
  } catch (error) {
    return handleApiError(error);
  }
} 