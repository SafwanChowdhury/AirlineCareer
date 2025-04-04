import { rawDb } from "./db";

async function migrateIdColumns() {
  try {
    console.log("Starting ID columns migration...");
    
    // Drop existing tables in reverse order of dependencies
    rawDb.exec(`
      DROP TABLE IF EXISTS flight_history;
      DROP TABLE IF EXISTS scheduled_flights;
      DROP TABLE IF EXISTS schedules;
    `);
    
    // Create tables with new schema
    rawDb.exec(`
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pilot_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_location TEXT NOT NULL,
        end_location TEXT NOT NULL,
        duration_days INTEGER DEFAULT 1,
        haul_preferences TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pilot_id) REFERENCES pilots (id)
      );

      CREATE TABLE IF NOT EXISTS scheduled_flights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        sequence_order INTEGER NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'scheduled',
        FOREIGN KEY (schedule_id) REFERENCES schedules (id),
        FOREIGN KEY (route_id) REFERENCES route_details (route_id)
      );

      CREATE TABLE IF NOT EXISTS flight_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pilot_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        arrival_time TIMESTAMP NOT NULL,
        departure_location TEXT NOT NULL,
        arrival_location TEXT NOT NULL,
        airline_iata TEXT NOT NULL,
        flight_duration_min INTEGER NOT NULL,
        status TEXT DEFAULT 'completed',
        FOREIGN KEY (pilot_id) REFERENCES pilots (id),
        FOREIGN KEY (route_id) REFERENCES route_details (route_id)
      );

      CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id);
      CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id);
    `);
    
    console.log("Successfully migrated ID columns!");
  } catch (error) {
    console.error("Error during ID columns migration:", error);
    process.exit(1);
  }
}

migrateIdColumns(); 