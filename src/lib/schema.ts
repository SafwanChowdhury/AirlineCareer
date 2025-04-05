import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const airports = sqliteTable("airports", {
  id: integer("id").primaryKey(),
  iataCode: text("iata_code").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull()
});

export const pilots = sqliteTable("pilots", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  homeBase: text("home_base").notNull(),
  currentLocation: text("current_location").notNull(),
  preferredAirline: text("preferred_airline"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey(),
  pilotId: integer("pilot_id").notNull().references(() => pilots.id),
  name: text("name").notNull(),
  startLocation: text("start_location").notNull(),
  durationDays: integer("duration_days").notNull(),
  haulPreferences: text("haul_preferences"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const routeDetails = sqliteTable("route_details", {
  routeId: integer("route_id").primaryKey(),
  departureIata: text("departure_iata").notNull(),
  departureCity: text("departure_city").notNull(),
  departureCountry: text("departure_country").notNull(),
  arrivalIata: text("arrival_iata").notNull(),
  arrivalCity: text("arrival_city").notNull(),
  arrivalCountry: text("arrival_country").notNull(),
  distanceKm: integer("distance_km").notNull(),
  durationMin: integer("duration_min").notNull(),
  airlineIata: text("airline_iata").notNull(),
  airlineName: text("airline_name").notNull()
});

export const scheduledFlights = sqliteTable("scheduled_flights", {
  id: integer("id").primaryKey(),
  scheduleId: integer("schedule_id").notNull().references(() => schedules.id),
  routeId: integer("route_id").notNull().references(() => routeDetails.routeId),
  sequenceOrder: integer("sequence_order").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  status: text("status").default("scheduled")
});

export const flightHistory = sqliteTable("flight_history", {
  id: integer("id").primaryKey(),
  pilotId: integer("pilot_id").notNull().references(() => pilots.id),
  routeId: integer("route_id").notNull().references(() => routeDetails.routeId),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  departureLocation: text("departure_location").notNull(),
  arrivalLocation: text("arrival_location").notNull(),
  airlineIata: text("airline_iata").notNull(),
  flightDurationMin: integer("flight_duration_min").notNull(),
  status: text("status").default("completed")
});

// Re-export tables from migration
export * from './migrations/0000_initial_schema'; 