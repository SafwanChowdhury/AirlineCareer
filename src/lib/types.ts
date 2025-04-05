import { InferModel } from "drizzle-orm";
import { 
  pilots, 
  schedules, 
  routeDetails, 
  scheduledFlights, 
  flightHistory,
  airports 
} from "./schema";

// Base types from schema
export type Pilot = InferModel<typeof pilots>;
export type Schedule = InferModel<typeof schedules>;
export type RouteDetail = InferModel<typeof routeDetails>;
export type ScheduledFlight = InferModel<typeof scheduledFlights>;
export type FlightHistory = InferModel<typeof flightHistory>;
export type Airport = InferModel<typeof airports>;

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

export interface CreateFlightRequest {
  scheduleId: number;
  routeId: number;
  sequenceOrder: number;
  departureTime: string;
  arrivalTime: string;
}

export interface UpdateFlightRequest {
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Response types
export interface FlightHistoryStats {
  totalFlights: number;
  totalMinutes: number;
  totalHours: number;
  airportsVisited: number;
  airlinesFlown: number;
}

// Component prop types
export interface SelectOption {
  value: string;
  label: string;
}

export interface AirlineSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface AirportSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeAirports?: string[];
}

// Context types
export interface PilotContextValue {
  pilot: Pilot | null;
  currentSchedule: Schedule | null;
  pilotStats: FlightHistoryStats | null;
  setPilot: (pilot: Pilot | null) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  loading: boolean;
  error: string | null;
}

// Utility types
export type NewSchedule = Omit<Schedule, "id" | "createdAt" | "updatedAt">;
export type NewPilot = Omit<Pilot, "id" | "createdAt" | "updatedAt">;

export interface RouteFilters {
  airline?: string;
  departure?: string;
  arrival?: string;
  country?: string;
  maxDuration?: number;
}

export interface RouteDetails {
  route_id: number;
  departure_iata: string;
  departure_city: string;
  departure_country: string;
  arrival_iata: string;
  arrival_city: string;
  arrival_country: string;
  distance_km: number;
  duration_min: number;
  airline_iata: string;
  airline_name: string;
} 