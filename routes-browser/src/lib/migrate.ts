import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, rawDb } from "./db";
import { pilots, schedules, airports } from "./schema";

// Run migrations
console.log("Running migrations...");
migrate(db, { migrationsFolder: "./drizzle" });

// Create tables if they don't exist
const createTables = () => {
  console.log("Creating tables if they don't exist...");
  
  // Create pilots table
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS pilots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      home_base TEXT NOT NULL,
      current_location TEXT NOT NULL,
      preferred_airline TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Create schedules table
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pilot_id TEXT NOT NULL,
      name TEXT NOT NULL,
      start_location TEXT NOT NULL,
      end_location TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      haul_preferences TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
};

createTables();
console.log("Database setup complete!"); 