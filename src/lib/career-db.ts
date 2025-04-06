// src/lib/career-db.ts
/**
 * Career database operations
 * This file contains functions for working with career-related data
 * such as pilots, schedules, and flights.
 */
import { db } from './db';
import {
  pilots,
  schedules,
  scheduledFlights,
  flightHistory
} from './career-schema';
import { eq, desc, sql, asc } from 'drizzle-orm';
import type {
  Pilot,
  Schedule,
  ScheduledFlight,
  CreatePilotRequest,
  CreateScheduleRequest,
  FlightHistoryStats,
} from './types';

/**
 * Create a new pilot profile
 * @param data Pilot profile data
 * @returns The created pilot record
 */
export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const timestamp = new Date().toISOString();
  
  // Ensure currentLocation is set (defaults to homeBase if not provided)
  const pilotData = {
    name: data.name,
    homeBase: data.homeBase,
    currentLocation: data.currentLocation || data.homeBase,
    preferredAirline: data.preferredAirline,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const [result] = await db.insert(pilots).values(pilotData).returning();
  
  return result;
}

/**
 * Get a pilot profile by ID
 * @param id Pilot ID
 * @returns Pilot profile or null if not found
 */
export async function getPilotProfileById(id: number): Promise<Pilot | null> {
  const result = await db.select().from(pilots).where(eq(pilots.id, id));
  return result[0] || null;
}

/**
 * Update a pilot's location
 * @param id Pilot ID
 * @param location New location (IATA code)
 */
export async function updatePilotLocation(id: number, location: string): Promise<void> {
  await db.update(pilots)
    .set({ 
      currentLocation: location,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, id));
}

/**
 * Create a new schedule
 * @param data Schedule data
 * @returns The created schedule record
 */
export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  const timestamp = new Date().toISOString();
  
  const [result] = await db.insert(schedules).values({
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  }).returning();
  
  return result;
}

/**
 * Interface for adding a flight to a schedule
 */
interface AddFlightToScheduleParams {
  scheduleId: number;
  routeId: number;
  sequenceOrder: number;
  departureTime: string;
  arrivalTime: string;
}

/**
 * Add a flight to a schedule
 * @param params Flight parameters
 * @returns The created scheduled flight
 */
export async function addFlightToSchedule(params: AddFlightToScheduleParams): Promise<ScheduledFlight> {
  const [result] = await db.insert(scheduledFlights).values({
    scheduleId: params.scheduleId,
    routeId: params.routeId,
    sequenceOrder: params.sequenceOrder,
    departureTime: params.departureTime,
    arrivalTime: params.arrivalTime,
    status: 'scheduled'
  }).returning();
  
  return result;
}

/**
 * Get all schedules for a pilot
 * @param pilotId Pilot ID
 * @returns Array of schedules
 */
export async function getSchedulesByPilotId(pilotId: number): Promise<Schedule[]> {
  return await db.select()
    .from(schedules)
    .where(eq(schedules.pilotId, pilotId))
    .orderBy(desc(schedules.createdAt));
}

/**
 * Get next scheduled flight for a pilot
 * @param pilotId Pilot ID 
 * @returns Next scheduled flight or null if none found
 */
export async function getNextFlightForPilot(pilotId: number): Promise<ScheduledFlight | null> {
  // First, get all schedules for this pilot
  const pilotSchedules = await getSchedulesByPilotId(pilotId);
  
  if (!pilotSchedules.length) {
    return null;
  }
  
  // Get schedule IDs
  const scheduleIds = pilotSchedules.map(s => s.id);
  
  // Find the next scheduled flight from any of the pilot's schedules
  const result = await db.select()
    .from(scheduledFlights)
    .where(
      sql`${scheduledFlights.scheduleId} IN (${scheduleIds.join(',')}) 
          AND ${scheduledFlights.status} IN ('scheduled', 'in_progress')`
    )
    .orderBy(asc(scheduledFlights.departureTime))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get flight history for a pilot
 * @param pilotId Pilot ID
 * @param limit Optional limit on number of records
 * @param offset Optional offset for pagination
 * @returns Array of flight history records
 */
export async function getFlightHistoryByPilotId(
  pilotId: number,
  limit?: number,
  offset?: number
): Promise<typeof flightHistory.$inferSelect[]> {
  // Start with the base query
  const baseQuery = db.select()
    .from(flightHistory)
    .where(eq(flightHistory.pilotId, pilotId))
    .orderBy(desc(flightHistory.departureTime));
  
  // Execute query with appropriate modifiers
  if (typeof limit === 'number' && typeof offset === 'number') {
    // Both limit and offset provided
    return baseQuery.limit(limit).offset(offset);
  } else if (typeof limit === 'number') {
    // Only limit provided
    return baseQuery.limit(limit);
  } else if (typeof offset === 'number') {
    // Only offset provided
    return baseQuery.offset(offset);
  } else {
    // No pagination
    return baseQuery;
  }
}

/**
 * Get flight statistics for a pilot
 * @param pilotId Pilot ID
 * @returns Statistics about the pilot's flights
 */
export async function getFlightHistoryStats(pilotId: number): Promise<FlightHistoryStats> {
  const result = await db.select({
    totalFlights: sql<number>`count(*)`,
    totalMinutes: sql<number>`sum(${flightHistory.flightDurationMin})`,
    airportsVisited: sql<number>`count(distinct ${flightHistory.arrivalLocation})`,
    airlinesFlown: sql<number>`count(distinct ${flightHistory.airlineIata})`
  })
  .from(flightHistory)
  .where(eq(flightHistory.pilotId, pilotId));
  
  const stats = result[0] || { 
    totalFlights: 0, 
    totalMinutes: 0, 
    airportsVisited: 0, 
    airlinesFlown: 0 
  };

  return {
    ...stats,
    totalHours: Math.round((stats.totalMinutes || 0) / 60)
  };
}