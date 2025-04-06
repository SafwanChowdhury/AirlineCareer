// src/lib/db.ts
/**
 * Database connection configuration
 * This file handles database connection initialization and exports
 * database instances for use throughout the application.
 */
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as path from "path";
import * as routesSchema from "./routes-schema";
import * as careerSchema from "./career-schema";

/**
 * Initialize the routes database connection
 * This database contains airline, airport, and route information
 */
const routesSqlite = new Database(path.join(process.cwd(), "routes.db"), {
  readonly: false,
  fileMustExist: false, // Allow creating the database if it doesn't exist
});

/**
 * Initialize the career database connection
 * This database contains pilot profiles, schedules, and flight history
 */
const careerSqlite = new Database(path.join(process.cwd(), "career.db"), {
  readonly: false,
  fileMustExist: false, // Allow creating the database if it doesn't exist
});

// Enable foreign keys for both databases
routesSqlite.pragma("foreign_keys = ON");
careerSqlite.pragma("foreign_keys = ON");

/**
 * Create drizzle database instances with appropriate schemas
 * These are the primary database interfaces that should be used in the application
 */
export const db = drizzle(careerSqlite, { schema: careerSchema });
export const routesDb = drizzle(routesSqlite, { schema: routesSchema });

/**
 * Export the raw sqlite instances for migrations and direct SQL operations
 * These should only be used when the ORM interface is insufficient
 */
export const rawRoutesDb = routesSqlite;
export const rawCareerDb = careerSqlite;

/**
 * Helper functions for common database operations
 */

/**
 * Get max duration of any route in the database - useful for UI sliders
 */
export async function getMaxRouteDuration(): Promise<number> {
  const result = await routesDb.select({
    maxDuration: routesSchema.routeDetails.durationMin
  })
    .from(routesSchema.routeDetails)
    .orderBy(routesSchema.routeDetails.durationMin)
    .limit(1);
  
  return result[0]?.maxDuration || 0;
}