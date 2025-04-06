// src/app/api/career/pilots/route.ts
import { db } from "@/lib/db";
import { pilots } from "@/lib/schema";
import { 
  handleApiError, 
  successResponse, 
  createdResponse,
  validateRequiredFields,
  logApiError 
} from '@/lib/api-utils';
import { asc } from 'drizzle-orm';

/**
 * GET handler for retrieving all pilots
 * Returns a list of all pilot profiles, ordered by name
 */
export async function GET() {
  try {
    const allPilots = await db.query.pilots.findMany({
      orderBy: [asc(pilots.name)],
    });
    
    return successResponse(allPilots, {
      message: `Retrieved ${allPilots.length} pilots`
    });
  } catch (error) {
    logApiError("pilots-api", error, { operation: "GET all" });
    return handleApiError(error);
  }
}

/**
 * POST handler for creating a new pilot
 * Requires name, homeBase, and optionally currentLocation and preferredAirline
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    validateRequiredFields(data, ['name', 'homeBase']);
    
    // Set current location to home base if not provided
    if (!data.currentLocation) {
      data.currentLocation = data.homeBase;
    }

    // Create pilot record with timestamps
    const timestamp = new Date().toISOString();
    const [pilot] = await db.insert(pilots).values({
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    }).returning();

    // Return the created pilot with 201 status
    return createdResponse(pilot, {
      message: `Pilot "${pilot.name}" created successfully`
    });
  } catch (error) {
    logApiError('pilots-api', error, { operation: "POST", requestData: request });
    return handleApiError(error);
  }
}