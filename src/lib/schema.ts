// src/lib/schema.ts
/**
 * Central schema export file
 * This file serves as the single entry point for all database schemas.
 * Any component that needs to access database tables should import from here.
 */

// Re-export all tables from specific schema files
// Routes database tables
export { airlines, airports, routeDetails } from './routes-schema';

// Career database tables
export { 
  pilots, 
  schedules, 
  scheduledFlights, 
  flightHistory 
} from './career-schema';

// Export database connection instances
export { db, routesDb } from './db';

// This facilitates imports like:
// import { pilots, db } from '@/lib/schema';