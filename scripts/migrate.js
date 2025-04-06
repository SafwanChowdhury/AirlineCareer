// scripts/migrate.js
/**
 * Database migration utility
 * This file contains functions to run migrations on both databases.
 *
 * Written in CommonJS for maximum compatibility with direct script execution.
 */
import { join } from "path";
import sqlite3 from "better-sqlite3";

// Initialize database connections directly since we can't import the db.ts module in a JS file
const routesDb = new sqlite3(join(process.cwd(), "routes.db"), {
  readonly: false,
  fileMustExist: false,
});

const careerDb = new sqlite3(join(process.cwd(), "career.db"), {
  readonly: false,
  fileMustExist: false,
});

// Enable foreign keys
routesDb.pragma("foreign_keys = ON");
careerDb.pragma("foreign_keys = ON");

/**
 * Executes a set of SQL migrations on a database
 * @param {object} db The database connection to use
 * @param {string[]} migrations Array of SQL statements to execute
 * @param {string} name Name of the database for logging
 */
function runMigrations(db, migrations, name) {
  console.log(`Running migrations for ${name} database...`);

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    try {
      console.log(`Executing migration ${i + 1}/${migrations.length}`);
      db.exec(migration);
    } catch (error) {
      console.error(`Migration ${i + 1} failed:`, error);
      console.error("SQL:", migration.substring(0, 100) + "...");

      // Don't throw on index creation failures - they might be views
      if (
        migration.trim().toUpperCase().startsWith("CREATE INDEX") &&
        error.message.includes("views may not be indexed")
      ) {
        console.warn(
          "Skipping index creation as the object appears to be a view"
        );
        continue;
      }

      throw error;
    }
  }

  console.log(`Completed ${migrations.length} migrations for ${name} database`);
}

/**
 * Check if a table exists and is not a view
 * @param {object} db The database connection
 * @param {string} tableName The table name to check
 * @returns {boolean} True if it's a table, false if not
 */
function isTable(db, tableName) {
  try {
    const result = db
      .prepare(
        "SELECT type FROM sqlite_master WHERE name = ? AND type = 'table'"
      )
      .get(tableName);
    return !!result;
  } catch (error) {
    console.error(`Error checking if ${tableName} is a table:`, error);
    return false;
  }
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
];

// Create indexes for better query performance on routes - separate for safer handling
const routeIndexMigrations = [
  // Only create these if route_details is a table, not a view
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
];

// Create indexes for better query performance - separate for safer handling
const careerIndexMigrations = [
  `CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id);`,
  `CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id);`,
  `CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id);`,
];

/**
 * Run migrations on the routes database
 */
function migrateRoutesDb() {
  // Run main table creation migrations
  runMigrations(routesDb, routesMigrations, "routes");

  // Only try to create indexes if route_details is a table, not a view
  if (isTable(routesDb, "route_details")) {
    console.log("Creating indexes on route_details table...");
    runMigrations(routesDb, routeIndexMigrations, "routes indexes");
  } else {
    console.log(
      "Skipping index creation for route_details as it is not a table or does not exist"
    );
  }
}

/**
 * Run migrations on the career database
 */
function migrateCareerDb() {
  // Run main table creation migrations
  runMigrations(careerDb, careerMigrations, "career");

  // Run index creation migrations
  runMigrations(careerDb, careerIndexMigrations, "career indexes");
}

/**
 * Run all migrations on both databases
 */
function migrateAll() {
  try {
    migrateRoutesDb();
    migrateCareerDb();
    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations when this script is executed directly
migrateAll();
