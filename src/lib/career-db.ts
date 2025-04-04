import { db } from './db';
import {
  pilots,
  schedules,
  scheduledFlights,
  flightHistory,
  routeDetails
} from './schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
  Pilot,
  Schedule,
  ScheduledFlight,
  FlightHistory,
  RouteDetail,
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

// Pilot Functions
export async function getPilotById(id: number): Promise<Pilot | undefined> {
  const result = await db
    .select()
    .from(pilots)
    .where(eq(pilots.id, id));
  return result[0];
}

export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const result = await db.insert(pilots).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return result[0];
}

export async function updatePilot(id: number, data: UpdatePilotRequest): Promise<Pilot> {
  const result = await db
    .update(pilots)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, id))
    .returning();
  
  if (!result[0]) {
    throw new ApiError('Pilot not found', 404);
  }
  
  return result[0];
}

export async function deletePilot(id: number): Promise<void> {
  const result = await db
    .delete(pilots)
    .where(eq(pilots.id, id))
    .returning();
  
  if (!result[0]) {
    throw new ApiError('Pilot not found', 404);
  }
}

// Schedule Functions
export async function getScheduleById(id: number): Promise<Schedule | undefined> {
  const result = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, id));
  return result[0];
}

export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  const result = await db.insert(schedules).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return result[0];
}

export async function updateSchedule(id: number, data: Partial<Schedule>): Promise<Schedule> {
  const result = await db
    .update(schedules)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(schedules.id, id))
    .returning();
  
  if (!result[0]) {
    throw new ApiError('Schedule not found', 404);
  }
  
  return result[0];
}

export async function deleteSchedule(id: number): Promise<void> {
  const result = await db
    .delete(schedules)
    .where(eq(schedules.id, id))
    .returning();
  
  if (!result[0]) {
    throw new ApiError('Schedule not found', 404);
  }
}

// Flight Functions
export async function getScheduledFlightById(id: number): Promise<ScheduledFlightWithRoute | undefined> {
  const result = await db
    .select({
      ...scheduledFlights,
      ...routeDetails
    })
    .from(scheduledFlights)
    .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.routeId))
    .where(eq(scheduledFlights.id, id));
  
  return result[0];
}

export async function updateFlightStatus(
  id: number,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
): Promise<ScheduledFlight> {
  const result = await db
    .update(scheduledFlights)
    .set({ status })
    .where(eq(scheduledFlights.id, id))
    .returning();
  
  if (!result[0]) {
    throw new ApiError('Flight not found', 404);
  }
  
  return result[0];
}

// Flight History Functions
export async function getFlightHistory(pilotId: number): Promise<FlightHistoryWithRoute[]> {
  return db
    .select({
      ...flightHistory,
      ...routeDetails
    })
    .from(flightHistory)
    .innerJoin(routeDetails, eq(flightHistory.routeId, routeDetails.routeId))
    .where(eq(flightHistory.pilotId, pilotId))
    .orderBy(desc(flightHistory.departureTime));
}

export async function getFlightHistoryStats(pilotId: number): Promise<FlightHistoryStats> {
  const result = await db
    .select({
      totalFlights: sql<number>`COUNT(*)`,
      totalMinutes: sql<number>`SUM(${flightHistory.flightDurationMin})`,
      airportsVisited: sql<number>`COUNT(DISTINCT ${flightHistory.departureLocation}) + COUNT(DISTINCT ${flightHistory.arrivalLocation})`,
      airlinesFlown: sql<number>`COUNT(DISTINCT ${flightHistory.airlineIata})`
    })
    .from(flightHistory)
    .where(eq(flightHistory.pilotId, pilotId))
    .groupBy(flightHistory.pilotId);

  return result[0] || {
    totalFlights: 0,
    totalMinutes: 0,
    airportsVisited: 0,
    airlinesFlown: 0
  };
}