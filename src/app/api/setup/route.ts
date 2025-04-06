// src/app/api/setup/route.ts
import { migrateAll } from '@/lib/migrate';
import { 
  handleApiError, 
  successResponse,
  logApiError 
} from '@/lib/api-utils';

/**
 * GET handler for initializing the database setup
 * Sets up both databases by running migrations
 */
export async function GET() {
  try {
    // Log the setup operation
    console.log("Setting up databases...");
    
    // Use the migration script to set up both databases
    await migrateAll();
    
    // Log successful completion
    console.log("Database setup complete!");
    
    // Return success response
    return successResponse(
      { migrated: true }, 
      { message: "Database setup completed successfully" }
    );
  } catch (error) {
    // Log the error
    logApiError('setup-api', error, { operation: "GET" });
    
    // Return error response
    return handleApiError(error);
  }
}