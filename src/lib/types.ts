// src/lib/types.ts
/**
 * Application type definitions
 * This file contains all the type definitions for the application,
 * derived from database schemas and enhanced for API and UI usage.
 */
import { InferSelectModel } from "drizzle-orm";
import { 
  pilots, 
  schedules, 
  scheduledFlights, 
  flightHistory
} from "./career-schema";

import {
  airlines,
  airports,
  routeDetails
} from "./routes-schema";

// Base types from schema - Career database
export type Pilot = InferSelectModel<typeof pilots>;
export type Schedule = InferSelectModel<typeof schedules>;
export type ScheduledFlight = InferSelectModel<typeof scheduledFlights>;
export type FlightHistory = InferSelectModel<typeof flightHistory>;

// Base types from schema - Routes database
export type Airline = InferSelectModel<typeof airlines>;
export type Airport = InferSelectModel<typeof airports>;
export type RouteDetail = InferSelectModel<typeof routeDetails>;

// Extended types for API responses
export interface PilotWithStats extends Pilot {
  totalFlights?: number;
  totalHours?: number;
}

export interface ScheduleWithFlights extends Schedule {
  flights: ScheduledFlightWithRoute[];
}

export interface ScheduledFlightWithRoute extends ScheduledFlight {
  departure_city?: string;
  departure_iata?: string;
  arrival_city?: string;
  arrival_iata?: string;
  airline_name?: string;
  airline_iata?: string;
  distance_km?: number;
  duration_min?: number;
}

export interface FlightHistoryWithRoute extends FlightHistory {
  departure_city?: string;
  arrival_city?: string;
  airline_name?: string;
}

// Statistics interface
export interface FlightHistoryStats {
  totalFlights: number;
  totalMinutes: number;
  totalHours: number;
  airportsVisited: number;
  airlinesFlown: number;
}

// Request types
export interface CreatePilotRequest {
  name: string;
  homeBase: string;
  currentLocation?: string;
  preferredAirline?: string;
}

export interface UpdatePilotRequest {
  name?: string;
  homeBase?: string;
  currentLocation?: string;
  preferredAirline?: string;
}

export interface CreateScheduleRequest {
  pilotId: number;
  name: string;
  startLocation: string;
  durationDays: number;
  haulPreferences?: string;
}

export interface UpdateScheduleRequest {
  name?: string;
  startLocation?: string;
  durationDays?: number;
  haulPreferences?: string;
}

// Pagination and filter types
export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface RoutesResponse {
  data: RouteDetail[];
  pagination: PaginationInfo;
}

export interface RouteFilters {
  airline?: string;
  departure?: string;
  arrival?: string;
  country?: string;
  maxDuration?: number;
}