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

// Pilot Functions
export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const [newPilot] = await db.insert(pilots).values({
    name: data.name,
    homeBase: data.homeBase,
    currentLocation: data.homeBase, // Current location defaults to home base
    preferredAirline: data.preferredAirline || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return newPilot;
}

export async function getPilots(): Promise<Pilot[]> {
  return db.select().from(pilots).orderBy(pilots.name);
}

export async function getPilotById(pilotId: number): Promise<Pilot | undefined> {
  const result = await db.select().from(pilots).where(eq(pilots.id, pilotId));
  return result[0];
}

export async function getPilotProfileById(pilotId: number): Promise<Pilot | undefined> {
  return getPilotById(pilotId);
}

export async function updatePilot(
  pilotId: number,
  data: Partial<Pilot>
): Promise<Pilot | undefined> {
  const [updatedPilot] = await db.update(pilots)
    .set({
      ...data,
      updatedAt: new Date().toISOString()
    })
    .where(eq(pilots.id, pilotId))
    .returning();
  
  return updatedPilot;
}

export async function updatePilotLocation(
  pilotId: number,
  newLocation: string
): Promise<Pilot | undefined> {
  return updatePilot(pilotId, { currentLocation: newLocation });
}

export async function deletePilot(pilotId: number): Promise<boolean> {
  const result = await db.delete(pilots)
    .where(eq(pilots.id, pilotId))
    .returning({ id: pilots.id });
  
  return result.length > 0;
}

// Schedule Functions
export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  const [newSchedule] = await db.insert(schedules).values({
    pilotId: data.pilotId.toString(), // Ensure pilotId is a string as per schema
    name: data.name,
    startLocation: data.startLocation,
    endLocation: data.endLocation,
    durationDays: data.durationDays,
    haulPreferences: data.haulPreferences || 'any',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }).returning();
  
  return newSchedule;
}

export async function getSchedulesByPilotId(pilotId: number): Promise<Schedule[]> {
  return db.select()
    .from(schedules)
    .where(eq(schedules.pilotId, pilotId.toString()))
    .orderBy(desc(schedules.createdAt));
}

export async function getScheduleById(scheduleId: number): Promise<Schedule | undefined> {
  const result = await db.select()
    .from(schedules)
    .where(eq(schedules.id, scheduleId));
  return result[0];
}

export async function deleteSchedule(scheduleId: number): Promise<boolean> {
  // First delete all scheduled flights for this schedule
  await db.delete(scheduledFlights)
    .where(eq(scheduledFlights.scheduleId, scheduleId));
  
  // Then delete the schedule
  const result = await db.delete(schedules)
    .where(eq(schedules.id, scheduleId))
    .returning({ id: schedules.id });
  
  return result.length > 0;
}

// Scheduled Flight Functions
export async function addFlightToSchedule(data: AddFlightToScheduleRequest): Promise<number> {
  const [newFlight] = await db.insert(scheduledFlights)
    .values(data)
    .returning({ id: scheduledFlights.id });
  
  return newFlight.id;
}

export async function getFlightsByScheduleId(scheduleId: number): Promise<ScheduledFlightWithRoute[]> {
  const result = await db.select({
    scheduledFlight: scheduledFlights,
    route: routeDetails
  })
  .from(scheduledFlights)
  .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.routeId))
  .where(eq(scheduledFlights.scheduleId, scheduleId))
  .orderBy(scheduledFlights.sequenceOrder);

  return result.map(row => ({
    ...row.scheduledFlight,
    ...row.route
  }));
}

export async function getNextFlightForPilot(pilotId: number): Promise<ScheduledFlightWithRoute | null> {
  const result = await db.select({
    scheduledFlight: scheduledFlights,
    route: routeDetails,
    schedule: schedules
  })
  .from(scheduledFlights)
  .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.routeId))
  .innerJoin(schedules, eq(scheduledFlights.scheduleId, schedules.id))
  .where(
    and(
      eq(schedules.pilotId, pilotId.toString()),
      eq(scheduledFlights.status, 'scheduled')
    )
  )
  .orderBy(scheduledFlights.departureTime)
  .limit(1);

  if (result.length === 0) return null;

  const { scheduledFlight, route, schedule } = result[0];
  return {
    ...scheduledFlight,
    ...route,
    schedule_name: schedule.name,
    pilot_id: pilotId
  };
}

export async function updateFlightStatus(
  flightId: number,
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
): Promise<ScheduledFlightWithRoute | null> {
  // First, get the flight details
  const flightDetails = await db.select({
    flight: scheduledFlights,
    route: routeDetails,
    schedule: schedules,
  })
  .from(scheduledFlights)
  .innerJoin(routeDetails, eq(scheduledFlights.routeId, routeDetails.routeId))
  .innerJoin(schedules, eq(scheduledFlights.scheduleId, schedules.id))
  .where(eq(scheduledFlights.id, flightId))
  .limit(1);

  if (flightDetails.length === 0) return null;

  const { flight, route, schedule } = flightDetails[0];
  const pilotId = parseInt(schedule.pilotId);

  // Update the flight status
  await db.update(scheduledFlights)
    .set({ status })
    .where(eq(scheduledFlights.id, flightId));

  // If flight is completed, add to flight history and update pilot location
  if (status === 'completed') {
    // Add to flight history
    await db.insert(flightHistory).values({
      pilotId,
      routeId: flight.routeId,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      departureLocation: route.departureIata,
      arrivalLocation: route.arrivalIata,
      airlineIata: route.airlineIata,
      flightDurationMin: route.durationMin,
      status: 'completed'
    });

    // Update pilot's current location
    await updatePilotLocation(pilotId, route.arrivalIata);
  }

  // If flight is cancelled, add to flight history
  if (status === 'cancelled') {
    await db.insert(flightHistory).values({
      pilotId,
      routeId: flight.routeId,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      departureLocation: route.departureIata,
      arrivalLocation: route.arrivalIata,
      airlineIata: route.airlineIata,
      flightDurationMin: route.durationMin,
      status: 'cancelled'
    });
  }

  // Return the updated flight
  return {
    ...flight,
    ...route,
    schedule_name: schedule.name,
    pilot_id: pilotId,
    status // Make sure to include the updated status
  };
}

// Flight History Functions
export async function getFlightHistoryByPilotId(
  pilotId: number,
  limit?: number,
  offset?: number
): Promise<FlightHistoryWithRoute[]> {
  let query = db.select({
    history: flightHistory,
    route: routeDetails
  })
  .from(flightHistory)
  .innerJoin(routeDetails, eq(flightHistory.routeId, routeDetails.routeId))
  .where(eq(flightHistory.pilotId, pilotId))
  .orderBy(desc(flightHistory.departureTime));

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.offset(offset);
  }

  const result = await query;

  return result.map(row => ({
    ...row.history,
    ...row.route
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
      totalMinutes: 0,
      totalHours: 0,
      airportsVisited: 0,
      airlinesFlown: 0
    };
  }

  const stats = result[0];
  return {
    ...stats,
    totalHours: Math.round((stats.totalMinutes || 0) / 60),
  };
}