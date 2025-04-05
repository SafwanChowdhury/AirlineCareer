// src/types/index.ts

export interface Airport {
    iata: string;
    name: string;
    city_name: string;
    country: string;
  }
  
  export interface Airline {
    iata: string;
    name: string;
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
  
  export interface PaginationInfo {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  }
  
  export interface RoutesResponse {
    data: RouteDetails[];
    pagination: PaginationInfo;
  }
  
  export interface RouteFilters {
    airline?: string;
    departure?: string;
    arrival?: string;
    country?: string;
    maxDuration?: number;
  }