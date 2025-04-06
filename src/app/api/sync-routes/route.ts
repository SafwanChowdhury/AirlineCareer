// src/app/api/sync-routes/route.ts
import { syncRouteDetails } from '@/lib/sync-routes';
import { 
  handleApiError, 
  successResponse,
  logApiError 
} from '@/lib/api-utils';

/**
 * POST handler for syncing route details between databases
 * Copies route data from routes database to career database
 */
export async function POST() {
  try {
    // Run the sync operation
    await syncRouteDetails();
    
    // Return success response
    return successResponse(
      { synced: true }, 
      { message: 'Route details synced successfully' }
    );
  } catch (error) {
    // Log the error
    logApiError('sync-routes-api', error, { operation: "POST" });
    
    // Return error response
    return handleApiError(error);
  }
}