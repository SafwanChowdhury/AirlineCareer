import { query } from './db';
import {
  Pilot,
  Schedule,
  FlightHistoryStats,
  ScheduledFlightWithRoute,
  FlightHistoryWithRoute
} from './types';
import { db } from './db';
import { pilots } from './schema';
import { eq } from 'drizzle-orm';

// Initialize career tables
export async function initializeCareerTables(): Promise<void> {
  // Create schedules table
  await query(`
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
    )
  `);

  // Create scheduled_flights table
  await query(`
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
    )
  `);

  // Create flight_history table
  await query(`
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
    )
  `);

  // Create indexes for better performance
  await query('CREATE INDEX IF NOT EXISTS idx_schedules_pilot_id ON schedules (pilot_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_scheduled_flights_schedule_id ON scheduled_flights (schedule_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_flight_history_pilot_id ON flight_history (pilot_id)');
}

// Pilot Functions
export async function createPilot(
  name: string,
  homeBase: string,
  currentLocation: string,
  preferredAirline?: string
): Promise<number> {
  const result = await db.insert(pilots).values({
    name,
    homeBase,
    currentLocation,
    preferredAirline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning({ id: pilots.id });
  
  return result[0].id;
}

export async function getPilots(): Promise<Pilot[]> {
  return db.select().from(pilots).orderBy(pilots.createdAt);
}

export async function getPilotById(pilotId: number): Promise<Pilot | undefined> {
  const result = await db.select().from(pilots).where(eq(pilots.id, pilotId));
  return result[0];
}

export async function updatePilot(
  pilotId: number,
  data: {
    name?: string;
    homeBase?: string;
    currentLocation?: string;
    preferredAirline?: string;
  }
): Promise<void> {
  await db.update(pilots)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, pilotId));
}

export async function updatePilotLocation(
  pilotId: number,
  newLocation: string
): Promise<void> {
  await db.update(pilots)
    .set({
      currentLocation: newLocation,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, pilotId));
}

// Schedule Functions
export async function createSchedule(
  pilotId: number,
  name: string,
  startLocation: string,
  endLocation: string,
  durationDays: number,
  preferences: string
): Promise<number> {
  const result = await query(
    `INSERT INTO schedules 
     (pilot_id, name, start_location, end_location, duration_days, haul_preferences)
     VALUES (?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [pilotId, name, startLocation, endLocation, durationDays, preferences]
  );
  return result[0].id;
}

export async function getSchedulesByPilotId(pilotId: number): Promise<Schedule[]> {
  return query(
    'SELECT * FROM schedules WHERE pilot_id = ? ORDER BY created_at DESC',
    [pilotId]
  );
}

export async function getScheduleById(scheduleId: number): Promise<Schedule | undefined> {
  const result = await query(
    'SELECT * FROM schedules WHERE id = ?',
    [scheduleId]
  );
  return result[0];
}

export async function deleteSchedule(scheduleId: number): Promise<void> {
  await query('DELETE FROM scheduled_flights WHERE schedule_id = ?', [scheduleId]);
  await query('DELETE FROM schedules WHERE id = ?', [scheduleId]);
}

// Scheduled Flight Functions
export async function addFlightToSchedule(
  scheduleId: number,
  routeId: number,
  sequenceOrder: number,
  departureTime: string,
  arrivalTime: string
): Promise<number> {
  const result = await query(
    `INSERT INTO scheduled_flights 
     (schedule_id, route_id, sequence_order, departure_time, arrival_time)
     VALUES (?, ?, ?, ?, ?)
     RETURNING id`,
    [scheduleId, routeId, sequenceOrder, departureTime, arrivalTime]
  );
  return result[0].id;
}

export async function getFlightsByScheduleId(scheduleId: number): Promise<ScheduledFlightWithRoute[]> {
  return query(
    `SELECT sf.*, rd.*
     FROM scheduled_flights sf
     JOIN route_details rd ON sf.route_id = rd.route_id
     WHERE sf.schedule_id = ?
     ORDER BY sf.sequence_order`,
    [scheduleId]
  );
}

export async function updateFlightStatus(
  scheduledFlightId: number,
  status: string
): Promise<void> {
  await query(
    'UPDATE scheduled_flights SET status = ? WHERE id = ?',
    [status, scheduledFlightId]
  );
}

export async function getNextFlightForPilot(pilotId: number): Promise<ScheduledFlightWithRoute | undefined> {
  const result = await query(
    `SELECT sf.*, rd.*, s.name as schedule_name
     FROM scheduled_flights sf
     JOIN schedules s ON sf.schedule_id = s.id
     JOIN route_details rd ON sf.route_id = rd.route_id
     WHERE s.pilot_id = ? AND sf.status = 'scheduled'
     ORDER BY sf.departure_time
     LIMIT 1`,
    [pilotId]
  );
  return result[0];
}

// Flight History Functions
export async function addFlightToHistory(
  pilotId: number,
  routeId: number,
  departureTime: string,
  arrivalTime: string,
  departureLocation: string,
  arrivalLocation: string,
  airlineIata: string,
  durationMin: number
): Promise<number> {
  const result = await query(
    `INSERT INTO flight_history 
     (pilot_id, route_id, departure_time, arrival_time, 
      departure_location, arrival_location, airline_iata, flight_duration_min)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [pilotId, routeId, departureTime, arrivalTime, 
     departureLocation, arrivalLocation, airlineIata, durationMin]
  );
  return result[0].id;
}

export async function getFlightHistoryByPilotId(
  pilotId: number,
  limit: number = 20,
  offset: number = 0
): Promise<FlightHistoryWithRoute[]> {
  return query(
    `SELECT fh.*, rd.*
     FROM flight_history fh
     JOIN route_details rd ON fh.route_id = rd.route_id
     WHERE fh.pilot_id = ?
     ORDER BY fh.departure_time DESC
     LIMIT ? OFFSET ?`,
    [pilotId, limit, offset]
  );
}

export async function getFlightHistoryStats(pilotId: number): Promise<FlightHistoryStats | undefined> {
  const result = await query(
    `SELECT 
      COUNT(*) as total_flights,
      SUM(flight_duration_min) as total_minutes,
      COUNT(DISTINCT departure_location) + COUNT(DISTINCT arrival_location) as airports_visited,
      COUNT(DISTINCT airline_iata) as airlines_flown
     FROM flight_history
     WHERE pilot_id = ?`,
    [pilotId]
  );
  return result[0];
}