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
  AddFlightToScheduleRequest,
  FlightHistoryStats,
  ScheduledFlightWithRoute,
  FlightHistoryWithRoute
} from './types';

// Initialize career tables - this should be handled by migrations instead
// but keeping for backwards compatibility
export async function initializeCareerTables(): Promise<void> {
  // Note: Table creation should be handled by migrations
  console.warn('initializeCareerTables is deprecated. Please use migrations instead.');
}

// Pilot Functions
export async function createPilot(data: CreatePilotRequest): Promise<number> {
  const result = await db.insert(pilots).values({
    ...data,
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
  data: Partial<Pilot>
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
  await updatePilot(pilotId, { currentLocation: newLocation });
}

// Schedule Functions
export async function createSchedule(data: CreateScheduleRequest): Promise<number> {
  const result = await db.insert(schedules).values({
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning({ id: schedules.id });
  
  return result[0].id;
}

export async function getSchedulesByPilotId(pilotId: number): Promise<Schedule[]> {
  return db.select()
    .from(schedules)
    .where(eq(schedules.pilotId, pilotId))
    .orderBy(desc(schedules.createdAt));
}

export async function getScheduleById(scheduleId: number): Promise<Schedule | undefined> {
  const result = await db.select()
    .from(schedules)
    .where(eq(schedules.id, scheduleId));
  return result[0];
}

export async function deleteSchedule(scheduleId: number): Promise<void> {
  await db.delete(scheduledFlights)
    .where(eq(scheduledFlights.scheduleId, scheduleId));
  await db.delete(schedules)
    .where(eq(schedules.id, scheduleId));
}

// Scheduled Flight Functions
export async function addFlightToSchedule(data: AddFlightToScheduleRequest): Promise<number> {
  const result = await db.insert(scheduledFlights)
    .values(data)
    .returning({ id: scheduledFlights.id });
  
  return result[0].id;
}

export async function getFlightsByScheduleId(scheduleId: number): Promise<ScheduledFlightWithRoute[]> {
  const result = await db.select({
    ...scheduledFlights,
    route: routeDetails
  })
  .from(scheduledFlights)
  .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.id))
  .where(eq(scheduledFlights.scheduleId, scheduleId))
  .orderBy(scheduledFlights.sequenceOrder);

  return result.map(row => ({
    ...row,
    route: row.route
  }));
}

export async function updateFlightStatus(
  scheduledFlightId: number,
  status: string
): Promise<void> {
  await db.update(scheduledFlights)
    .set({ status })
    .where(eq(scheduledFlights.id, scheduledFlightId));
}

// Flight History Functions
export async function addFlightToHistory(
  pilotId: number,
  routeId: number,
  data: Partial<FlightHistory>
): Promise<number> {
  const result = await db.insert(flightHistory)
    .values({
      pilotId,
      routeId,
      ...data,
      status: data.status || 'completed'
    })
    .returning({ id: flightHistory.id });
  
  return result[0].id;
}

export async function getFlightHistory(pilotId: number): Promise<FlightHistoryWithRoute[]> {
  const result = await db.select({
    ...flightHistory,
    route: routeDetails
  })
  .from(flightHistory)
  .innerJoin(routeDetails, eq(flightHistory.routeId, routeDetails.id))
  .where(eq(flightHistory.pilotId, pilotId))
  .orderBy(desc(flightHistory.departureTime));

  return result.map(row => ({
    ...row,
    route: row.route
  }));
}

export async function getFlightHistoryStats(pilotId: number): Promise<FlightHistoryStats> {
  const result = await db.select({
    totalFlights: sql<number>`count(*)`,
    totalMinutes: sql<number>`sum(${flightHistory.flightDurationMin})`,
    airportsVisited: sql<number>`count(distinct ${flightHistory.departureLocation}) + count(distinct ${flightHistory.arrivalLocation})`,
    airlinesFlown: sql<number>`count(distinct ${flightHistory.airlineIata})`
  })
  .from(flightHistory)
  .where(eq(flightHistory.pilotId, pilotId))
  .groupBy(flightHistory.pilotId);

  if (!result.length) {
    return {
      totalFlights: 0,
      totalHours: 0,
      airportsVisited: 0,
      airlinesFlown: 0
    };
  }

  const stats = result[0];
  return {
    ...stats,
    totalHours: Math.round((stats.totalMinutes || 0) / 60),
    airportsVisited: stats.airportsVisited || 0,
    airlinesFlown: stats.airlinesFlown || 0
  };
}