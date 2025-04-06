// src/lib/career-schema.ts
/**
 * Schema definitions for the career database
 * This file contains all tables related to pilots, schedules, and flight history.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Pilot information table - stores basic pilot profile data
 */
export const pilots = sqliteTable("pilots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  homeBase: text("home_base").notNull(),
  currentLocation: text("current_location").notNull(),
  preferredAirline: text("preferred_airline"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

/**
 * Flight schedules table - stores pilot-specific schedule information
 */
export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pilotId: integer("pilot_id").notNull().references(() => pilots.id),
  name: text("name").notNull(),
  startLocation: text("start_location").notNull(),
  durationDays: integer("duration_days").notNull(),
  haulPreferences: text("haul_preferences"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

/**
 * Scheduled flights table - stores pilot-specific flight scheduling info
 */
export const scheduledFlights = sqliteTable("scheduled_flights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scheduleId: integer("schedule_id").notNull().references(() => schedules.id),
  routeId: integer("route_id").notNull(), // References route_id in routes.db
  sequenceOrder: integer("sequence_order").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  status: text("status").default("scheduled")
});

/**
 * Flight history table - stores pilot-specific flight history
 */
export const flightHistory = sqliteTable("flight_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pilotId: integer("pilot_id").notNull().references(() => pilots.id),
  routeId: integer("route_id").notNull(), // References route_id in routes.db
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureLocation: text("departure_location").notNull(),
  arrivalLocation: text("arrival_location").notNull(),
  airlineIata: text("airline_iata").notNull(),
  flightDurationMin: integer("flight_duration_min").notNull(),
  status: text("status").default("completed")
});