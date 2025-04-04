import { useSwrFetch } from './use-swr-fetch';

export interface Airport {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export function useAirports() {
  return useSwrFetch<Airport[]>('/api/airports');
} 