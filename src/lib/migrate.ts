// src/lib/migrate.ts
/**
 * Database migration utility
 * This file contains functions to run migrations on both databases.
 * It uses the raw database connections to execute SQL statements.
 */
import { rawRoutesDb, rawCareerDb } from './db';
/**
 * Executes a set of SQL migrations on a database
 * @param db The database connection to use
 * @param migrations Array of SQL statements to execute
 * @param name Name of the database for logging
 */
function runMigrations(db: { exec: (sql: string) => void }, migrations: string[], name: string): void {
  console.log(`Running migrations for ${name} database...`);
  
  for (const [index, migration] of migrations.entries()) {
    try {
      console.log(`Executing migration ${index + 1}/${migrations.length}`);
      db.exec(migration);
    } catch (error) {
      console.error(`Migration ${index + 1} failed:`, error);
      console.error('SQL:', migration.substring(0, 100) + '...');
      throw error;
    }
  }
  
  console.log(`Completed ${migrations.length} migrations for ${name} database`);
}

/**
 * Routes database migrations
 * These migrations create and set up the tables in the routes database
 */
const routesMigrations = [
  // Airlines table
  `CREATE TABLE IF NOT EXISTS airlines (
    iata TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );`,

  // Airports table
  `CREATE TABLE IF NOT EXISTS airports (
    iata TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city_name TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude TEXT,
    longitude TEXT
  );`,

  // Route details table
  `CREATE TABLE IF NOT EXISTS route_details (
    route_id INTEGER PRIMARY KEY,
    departure_iata TEXT NOT NULL,
    departure_city TEXT NOT NULL,
    departure_country TEXT NOT NULL,
    arrival_iata TEXT NOT NULL,
    arrival_city TEXT NOT NULL,
    arrival_country TEXT NOT NULL,
    distance_km INTEGER NOT NULL,
    duration_min INTEGER NOT NULL,
    airline_iata TEXT NOT NULL,
    airline_name TEXT NOT NULL
  );`,

  // Create indexes for better query performance on routes
  `CREATE INDEX IF NOT EXISTS idx_route_details_departure ON route_details (departure_iata);`,
  `CREATE INDEX IF NOT EXISTS idx_route_details_arrival ON route_details (arrival_iata);`,
  `CREATE INDEX IF NOT EXISTS idx_route_details_airline ON route_details (airline_iata);`,
];

/**
 * Career database migrations
 * These migrations create and set up the tables in the career database
 */
const careerMigrations = [
  // Pilots table
  `CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    home_base TEXT NOT NULL,
    current_location TEXT NOT NULL,
    preferred_airline TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

  // Schedules table
  `CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilot_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_location TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    haul_preferences TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (pilot_id) REFERENCES pilots (id)
  );`,

  // Scheduled flights table
  `CREATE TABLE IF NOT EXISTS scheduled_flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (schedule_id) REFERENCES schedules (id)
  );`,

  // Flight history table
  `CREATE TABLE IF NOT EXISTS flight_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilot_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    departure_location TEXT NOT NULL,
    arrival_location TEXT NOT NULL,
    airline_iata TEXT NOT NULL,
    flight_duration_min INTEGER NOT NULL,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (pilot_id) REFERENCES pilots (id)
  );`,

  // Create indexes for better query performance
  `CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id);`,
  `CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id);`,
  `CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id);`,
];

/**
 * Run migrations on the routes database
 */
export function migrateRoutesDb(): void {
  runMigrations(rawRoutesDb, routesMigrations, 'routes');
}

/**
 * Run migrations on the career database
 */
export function migrateCareerDb(): void {
  runMigrations(rawCareerDb, careerMigrations, 'career');
}

/**
 * Run all migrations on both databases
 */
export function migrateAll(): void {
  try {
    migrateRoutesDb();
    migrateCareerDb();
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Check if this file is being run directly
if (require.main === module) {
  try {
    migrateAll();
    console.log('Migration script completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}