import { rawCareerDb } from './db';

// Run migrations
const migrations = [
  // Initial schema
  `CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    home_base TEXT NOT NULL,
    current_location TEXT NOT NULL,
    preferred_airline TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,

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

  `CREATE TABLE IF NOT EXISTS scheduled_flights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    FOREIGN KEY (schedule_id) REFERENCES schedules (id),
    FOREIGN KEY (route_id) REFERENCES route_details (route_id)
  );`,

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
    FOREIGN KEY (pilot_id) REFERENCES pilots (id),
    FOREIGN KEY (route_id) REFERENCES route_details (route_id)
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id);`,
  `CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id);`,
  `CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id);`
];

// Run each migration
migrations.forEach(migration => {
  try {
    rawCareerDb.exec(migration);
    console.log('Migration successful:', migration.split('\n')[0]);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
});

console.log('All migrations completed successfully'); 