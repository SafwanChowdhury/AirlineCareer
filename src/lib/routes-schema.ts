// src/lib/routes-schema.ts
/**
 * Schema definitions for the routes database
 * This file contains all tables related to airlines, airports, and route information.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Airlines table for route lookups
 */
export const airlines = sqliteTable("airlines", {
  iata: text("iata").primaryKey(),
  name: text("name").notNull()
});

/**
 * Airports table for route lookups
 */
export const airports = sqliteTable("airports", {
  iata: text("iata").primaryKey(),
  name: text("name").notNull(),
  cityName: text("city_name").notNull(),
  country: text("country").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude")
});

/**
 * Route details table - contains information about flight routes
 */
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