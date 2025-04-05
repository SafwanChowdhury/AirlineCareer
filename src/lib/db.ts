// src/lib/db.ts

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as path from "path";
import * as routesSchema from "./routes-schema";
import * as careerSchema from "./career-schema";

interface RouteFilters {
  airline?: string;
  departure?: string;
  arrival?: string;
  country?: string;
  maxDuration?: number;
}

interface Route {
  route_id: number;
  departure_iata: string;
  departure_city: string;
  departure_country: string;
  arrival_iata: string;
  arrival_city: string;
  arrival_country: string;
  distance_km: number;
  duration_min: number;
  airline_iata: string;
  airline_name: string;
}

interface Airline {
  iata: string;
  name: string;
}

interface Airport {
  iata: string;
  name: string;
  city_name: string;
  country: string;
}

// Initialize the routes database connection
const routesSqlite = new Database(path.join(process.cwd(), "routes.db"), {
  readonly: false,
  fileMustExist: false, // Allow creating the database if it doesn't exist
});

// Initialize the career database connection
const careerSqlite = new Database(path.join(process.cwd(), "career.db"), {
  readonly: false,
  fileMustExist: false, // Allow creating the database if it doesn't exist
});

// Enable foreign keys for both databases
routesSqlite.pragma("foreign_keys = ON");
careerSqlite.pragma("foreign_keys = ON");

// Create drizzle database instances with appropriate schemas
export const db = drizzle(careerSqlite, { schema: careerSchema });
export const routesDb = drizzle(routesSqlite, { schema: routesSchema });

// Export the raw sqlite instances for migrations
export const rawRoutesDb = routesSqlite;
export const rawCareerDb = careerSqlite;

// Helper function to run queries with proper error handling on the routes database
export function query(sql: string, params: any[] = []) {
  try {
    const stmt = routesSqlite.prepare(sql);
    return stmt.all(params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Get all routes with details (paginated)
export async function getRoutes(
  page = 1,
  limit = 20,
  filters: RouteFilters = {}
): Promise<Route[]> {
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
  
  return query<Route>(sql, params);
}

// Get route count (for pagination)
export async function getRoutesCount(filters: RouteFilters = {}): Promise<number> {
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
  
  const result = await query<{ count: number }>(sql, params);
  return result[0]?.count || 0;
}

// Get all airlines
export async function getAirlines(): Promise<Airline[]> {
  return query<Airline>(`
    SELECT DISTINCT iata, name
    FROM airlines
    ORDER BY name
  `);
}

// Get all airports
export async function getAirports(): Promise<Airport[]> {
  return query<Airport>(`
    SELECT iata, name, city_name, country
    FROM airports
    ORDER BY city_name
  `);
}

// Get all countries that have airports
export async function getCountries(): Promise<string[]> {
  const results = await query<{ country: string }>(`
    SELECT DISTINCT country
    FROM airports
    WHERE country != ''
    ORDER BY country
  `);
  console.log('Database query results:', results);
  return results.map(r => r.country);
}

// Get route by ID
export async function getRouteById(id: number): Promise<Route | undefined> {
  const routes = await query<Route>(`
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
  const result = await query<{ max_duration: number }>(`
    SELECT MAX(duration_min) as max_duration
    FROM route_details
  `);
  
  return result[0]?.max_duration || 0;
}

// Re-export schema types for convenience
export * from './routes-schema';
export * from './career-schema';