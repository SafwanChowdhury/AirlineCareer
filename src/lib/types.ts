import { InferModel } from "drizzle-orm";
import { airports, schedules, pilots } from "./schema";

export type Airport = InferModel<typeof airports>;
export type Schedule = InferModel<typeof schedules>;
export type Pilot = InferModel<typeof pilots>;

export type NewSchedule = Omit<Schedule, "id">;
export type NewPilot = Omit<Pilot, "id" | "createdAt" | "updatedAt">;

export interface ScheduledFlight {
  id: number;
  schedule_id: number;
  route_id: number;
  sequence_order: number;
  departure_time: string;
  arrival_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface FlightHistory {
  id: number;
  pilot_id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  departure_location: string;
  arrival_location: string;
  airline_iata: string;
  flight_duration_min: number;
  status: 'completed' | 'cancelled';
}

export interface FlightHistoryStats {
  total_flights: number;
  total_minutes: number;
  airports_visited: number;
  airlines_flown: number;
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

export interface ScheduledFlightWithRoute extends ScheduledFlight, RouteDetails {
  schedule_name?: string;
  pilot_id: number;
}

export interface FlightHistoryWithRoute extends FlightHistory, RouteDetails {} 