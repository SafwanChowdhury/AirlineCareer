// src/lib/db.ts

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import * as schema from "./schema";

// Initialize the database connection
const sqlite = new Database(path.join(process.cwd(), "routes.db"), {
  readonly: false,
  fileMustExist: false, // Allow creating the database if it doesn't exist
});

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS pilots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    home_base TEXT NOT NULL,
    current_location TEXT NOT NULL,
    preferred_airline TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

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
  );
`);

// Create drizzle database instance
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for migrations
export const rawDb = sqlite;

// Helper function to run queries
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const stmt = sqlite.prepare(sql);
  return stmt.all(params) as T[];
}

// Get all routes with details (paginated)
export async function getRoutes(
  page = 1, 
  limit = 20, 
  filters: {
    airline?: string,
    departure?: string,
    arrival?: string,
    country?: string,
    maxDuration?: number
  } = {}
): Promise<any[]> {
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT 
      route_id,
      departure_iata,
      departure_city,
      departure_country,
      arrival_iata,
      arrival_city,
      arrival_country,
      distance_km,
      duration_min,
      airline_iata,
      airline_name
    FROM route_details
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  if (filters.airline) {
    sql += ` AND airline_name LIKE ?`;
    params.push(`%${filters.airline}%`);
  }
  
  if (filters.departure) {
    sql += ` AND (departure_iata = ? OR departure_city LIKE ?)`;
    params.push(filters.departure, `%${filters.departure}%`);
  }
  
  if (filters.arrival) {
    sql += ` AND (arrival_iata = ? OR arrival_city LIKE ?)`;
    params.push(filters.arrival, `%${filters.arrival}%`);
  }
  
  if (filters.country) {
    sql += ` AND (departure_country = ? OR arrival_country = ?)`;
    params.push(filters.country, filters.country);
  }
  
  if (filters.maxDuration && !isNaN(Number(filters.maxDuration))) {
    sql += ` AND duration_min <= ?`;
    params.push(filters.maxDuration);
  }
  
  sql += ` ORDER BY departure_iata, arrival_iata LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  return query(sql, params);
}

// Get route count (for pagination)
export async function getRoutesCount(filters: {
  airline?: string,
  departure?: string,
  arrival?: string,
  country?: string,
  maxDuration?: number
} = {}): Promise<number> {
  let sql = `
    SELECT COUNT(*) as count
    FROM route_details
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  if (filters.airline) {
    sql += ` AND airline_name LIKE ?`;
    params.push(`%${filters.airline}%`);
  }
  
  if (filters.departure) {
    sql += ` AND (departure_iata = ? OR departure_city LIKE ?)`;
    params.push(filters.departure, `%${filters.departure}%`);
  }
  
  if (filters.arrival) {
    sql += ` AND (arrival_iata = ? OR arrival_city LIKE ?)`;
    params.push(filters.arrival, `%${filters.arrival}%`);
  }
  
  if (filters.country) {
    sql += ` AND (departure_country = ? OR arrival_country = ?)`;
    params.push(filters.country, filters.country);
  }
  
  if (filters.maxDuration && !isNaN(Number(filters.maxDuration))) {
    sql += ` AND duration_min <= ?`;
    params.push(filters.maxDuration);
  }
  
  const result = await query(sql, params);
  return result[0]?.count || 0;
}

// Get all airlines
export async function getAirlines(): Promise<any[]> {
  return query(`
    SELECT DISTINCT iata, name
    FROM airlines
    ORDER BY name
  `);
}

// Get all airports
export async function getAirports(): Promise<any[]> {
  return query(`
    SELECT iata, name, city_name, country
    FROM airports
    ORDER BY city_name
  `);
}

// Get all countries that have airports
export async function getCountries(): Promise<any[]> {
  return query(`
    SELECT DISTINCT country
    FROM airports
    WHERE country != ''
    ORDER BY country
  `);
}

// Get route by ID
export async function getRouteById(id: number): Promise<any> {
  const routes = await query(`
    SELECT 
      route_id,
      departure_iata,
      departure_city,
      departure_country,
      arrival_iata,
      arrival_city,
      arrival_country,
      distance_km,
      duration_min,
      airline_iata,
      airline_name
    FROM route_details
    WHERE route_id = ?
  `, [id]);
  
  return routes[0];
}

// Get maximum route duration (for slider)
export async function getMaxDuration(): Promise<number> {
  const result = await query(`
    SELECT MAX(duration_min) as max_duration
    FROM routes
  `);
  
  return result[0]?.max_duration || 0;
}