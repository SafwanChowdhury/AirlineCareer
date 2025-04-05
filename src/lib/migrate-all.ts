import { rawRoutesDb, rawCareerDb } from './db';

// Routes database migrations
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

// Career database migrations
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

  // Scheduled flights table - stores pilot-specific flight scheduling info
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

  // Flight history table - stores pilot-specific flight history
  `CREATE TABLE IF NOT EXISTS flight_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pilot_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY (pilot_id) REFERENCES pilots (id)
  );`,

  // Create indexes for better query performance
  `CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id);`,
  `CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id);`,
  `CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id);`,
];

// Apply migrations to routes database
export async function migrateRoutesDb() {
  console.log('Migrating routes database...');
  for (const migration of routesMigrations) {
    console.log(`Executing: ${migration.substring(0, 60)}...`);
    rawRoutesDb.exec(migration);
  }
  console.log('Routes database migration completed.');
}

// Apply migrations to career database
export async function migrateCareerDb() {
  console.log('Migrating career database...');
  for (const migration of careerMigrations) {
    console.log(`Executing: ${migration.substring(0, 60)}...`);
    rawCareerDb.exec(migration);
  }
  console.log('Career database migration completed.');
}

// Function to run both migrations
export async function migrateAll() {
  try {
    await migrateRoutesDb();
    await migrateCareerDb();
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// If this file is executed directly, run the migrations
if (require.main === module) {
  migrateAll()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
} 