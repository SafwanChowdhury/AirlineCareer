// src/app/api/migrate/route.ts
import { migrateAll, migrateRoutesDb, migrateCareerDb } from '@/lib/migrate';
import { 
  handleApiError, 
  successResponse,
  logApiError 
} from '@/lib/api-utils';

/**
 * API route for running database migrations
 * Can target specific databases or migrate all databases
 * 
 * @route POST /api/migrate
 */
export async function POST(request: Request) {
  try {
    // Get the 'db' parameter from the URL
    const { searchParams } = new URL(request.url);
    const dbType = searchParams.get('db');
    
    // Migrate the specified database(s)
    if (dbType === 'routes') {
      await migrateRoutesDb();
      return successResponse(
        { migrated: 'routes' }, 
        { message: 'Routes database migrations completed successfully' }
      );
    } else if (dbType === 'career') {
      await migrateCareerDb();
      return successResponse(
        { migrated: 'career' }, 
        { message: 'Career database migrations completed successfully' }
      );
    } else {
      // Migrate both by default
      await migrateAll();
      return successResponse(
        { migrated: 'all' }, 
        { message: 'All database migrations completed successfully' }
      );
    }
  } catch (error) {
    // Log the error
    logApiError('migrate-api', error, { operation: "POST" });
    
    // Return error response
    return handleApiError(error);
  }
}