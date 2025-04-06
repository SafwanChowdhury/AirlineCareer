import { useSwrFetch } from './use-swr-fetch';
import { useSWRConfig } from 'swr';
import type { 
  Pilot, 
  FlightHistoryStats, 
  FlightHistoryWithRoute,
  ScheduledFlightWithRoute,
  CreatePilotRequest,
  UpdatePilotRequest
} from '../types';

/**
 * Fetches a pilot profile by ID
 * @param pilotId The ID of the pilot to fetch
 */
export function usePilotProfile(pilotId: number | null) {
  return useSwrFetch<Pilot>(
    pilotId ? `/api/career/pilots/${pilotId}` : null
  );
}

/**
 * Fetches pilot statistics by ID
 * @param pilotId The ID of the pilot to fetch stats for
 */
export function usePilotStats(pilotId: number | null) {
  return useSwrFetch<FlightHistoryStats>(
    pilotId ? `/api/career/pilots/${pilotId}/stats` : null
  );
}

/**
 * Fetches pilot flight history
 * @param pilotId The ID of the pilot to fetch history for
 */
export function usePilotHistory(pilotId: number | null) {
  return useSwrFetch<FlightHistoryWithRoute[]>(
    pilotId ? `/api/career/pilots/${pilotId}/history` : null
  );
}

/**
 * Fetches scheduled flights for a pilot
 * @param pilotId The ID of the pilot to fetch scheduled flights for
 */
export function useScheduledFlights(pilotId: number | null) {
  return useSwrFetch<ScheduledFlightWithRoute[]>(
    pilotId ? `/api/career/pilots/${pilotId}/scheduled-flights` : null,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
}

/**
 * Creates a new pilot
 * @param data The pilot data to create
 */
export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const response = await fetch('/api/career/pilots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create pilot');
  }
  
  const json = await response.json();
  return json.data;
}

/**
 * Updates an existing pilot
 * @param id The ID of the pilot to update
 * @param data The pilot data to update
 */
export async function updatePilot(id: number, data: UpdatePilotRequest): Promise<Pilot> {
  const response = await fetch(`/api/career/pilots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update pilot');
  }
  
  const json = await response.json();
  return json.data;
}

/**
 * Updates the status of a flight
 * @param flightId The ID of the flight to update
 * @param status The new status for the flight
 * @returns The updated flight data
 */
export async function updateFlightStatus(
  flightId: number,
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
) {
  const res = await fetch(`/api/career/flights/${flightId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update flight status");
  }

  // Get the response data
  const data = await res.json();
  return data.data || data;
}

/**
 * Utility to revalidate all pilot-related data
 * This should be called in a React component after using updateFlightStatus
 * @param pilotId The ID of the pilot to revalidate data for
 */
export function useRevalidatePilotData() {
  const { mutate } = useSWRConfig();
  
  return async (pilotId: number) => {
    if (pilotId) {
      await Promise.all([
        mutate(`/api/career/pilots/${pilotId}`),
        mutate(`/api/career/pilots/${pilotId}/stats`),
        mutate(`/api/career/pilots/${pilotId}/scheduled-flights`),
        mutate(`/api/career/pilots/${pilotId}/history`),
      ]);
    }
  };
} 