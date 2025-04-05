import { useSwrFetch } from './use-swr-fetch';

export interface Airline {
  iata: string;
  name: string;
  country: string;
}

export function useAirlines() {
  return useSwrFetch<Airline[]>('/api/airlines');
} 