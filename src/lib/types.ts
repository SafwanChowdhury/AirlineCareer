// src/lib/types.ts
/**
 * Application type definitions
 * This file contains all the type definitions for the application,
 * derived from database schemas and enhanced for API and UI usage.
 */
import { InferModel } from "drizzle-orm";
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
export type Pilot = InferModel<typeof pilots>;
export type Schedule = InferModel<typeof schedules>;
export type ScheduledFlight = InferModel<typeof scheduledFlights>;
export type FlightHistory = InferModel<typeof flightHistory>;

// Base types from schema - Routes database
export type Airline = InferModel<typeof airlines>;
export type Airport = InferModel<typeof airports>;
export type RouteDetail = InferModel<typeof routeDetails>;

// Extended types for API responses
export interface PilotWithStats extends Pilot {
  totalFlights?: number;
  totalHours?: number;
}

export interface ScheduleWithFlights extends Schedule {
  flights: ScheduledFlightWithRoute[];
}

export interface ScheduledFlightWithRoute extends ScheduledFlight {
  route: RouteDetail;
  scheduleName?: string;
}

export interface FlightHistoryWithRoute extends FlightHistory {
  route: RouteDetail;
}

// Request types
export interface CreatePilotRequest {
  name: string;
  homeBase: string;
  currentLocation: string;
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