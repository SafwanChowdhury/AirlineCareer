import { NextResponse } from 'next/server';
import { db, rawDb } from '@/lib/db';

export async function GET() {
  try {
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

    // Create pilot_profiles table
    rawDb.exec(`
      CREATE TABLE IF NOT EXISTS pilot_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pilot_id INTEGER NOT NULL,
        total_flights INTEGER DEFAULT 0,
        total_hours INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (pilot_id) REFERENCES pilots(id)
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

    console.log("Database setup complete!");
    return NextResponse.json({ message: "Database setup completed successfully" });
  } catch (error) {
    console.error("Error during setup:", error);
    return NextResponse.json(
      { error: "Failed to set up database" },
      { status: 500 }
    );
  }
} 