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
  UpdatePilotRequest,
  FlightHistoryStats,
  ScheduledFlightWithRoute,
  FlightHistoryWithRoute
} from './types';
import { ApiError } from './api-utils';

// Initialize career tables - this should be handled by migrations instead
// but keeping for backwards compatibility
export async function initializeCareerTables(): Promise<void> {
  // Note: Table creation should be handled by migrations
  console.warn('initializeCareerTables is deprecated. Please use migrations instead.');
}

export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const result = await db.insert(pilots).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return result[0];
}

export async function getPilotProfileById(id: number): Promise<Pilot | null> {
  const result = await db.select().from(pilots).where(eq(pilots.id, id));
  return result[0] || null;
}

export async function updatePilotLocation(id: number, location: string): Promise<void> {
  await db.update(pilots)
    .set({ 
      currentLocation: location,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, id));
}

export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  const result = await db.insert(schedules).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return result[0];
}

export async function getSchedulesByPilotId(pilotId: number): Promise<Schedule[]> {
  return await db.select().from(schedules).where(eq(schedules.pilotId, pilotId));
}

export async function getNextFlightForPilot(pilotId: number): Promise<ScheduledFlight | null> {
  const result = await db.select()
    .from(scheduledFlights)
    .where(eq(scheduledFlights.scheduleId, pilotId))
    .orderBy(asc(scheduledFlights.departureTime))
    .limit(1);
  
  return result[0] || null;
}

export async function getFlightHistoryByPilotId(pilotId: number): Promise<typeof flightHistory.$inferSelect[]> {
  return await db.select()
    .from(flightHistory)
    .where(eq(flightHistory.pilotId, pilotId))
    .orderBy(desc(flightHistory.departureTime));
}

export async function getFlightHistoryStats(pilotId: number): Promise<FlightHistoryStats> {
  const result = await db.select({
    totalFlights: sql<number>`count(*)`,
    totalMinutes: sql<number>`sum(duration_min)`,
    airportsVisited: sql<number>`count(distinct arrival_iata)`,
    airlinesFlown: sql<number>`count(distinct airline_iata)`
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
    totalHours: Math.round(stats.totalMinutes / 60)
  };
}