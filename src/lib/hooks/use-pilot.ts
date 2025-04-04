import useSWR, { mutate } from "swr";
import { PilotProfile, FlightHistoryStats, ScheduledFlightWithRoute } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePilotProfile(pilotId: number) {
  const { data, error, isLoading } = useSWR<PilotProfile>(
    `/api/career/pilots/${pilotId}`,
    fetcher
  );

  return {
    pilot: data,
    isLoading,
    isError: error,
  };
}

export function usePilotStats(pilotId: number) {
  const { data, error, isLoading } = useSWR<FlightHistoryStats>(
    `/api/career/pilots/${pilotId}/stats`,
    fetcher
  );

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}

export function useScheduledFlights(pilotId: number) {
  const { data, error, isLoading } = useSWR<ScheduledFlightWithRoute[]>(
    `/api/career/pilots/${pilotId}/scheduled-flights`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    flights: data || [],
    isLoading,
    isError: error,
  };
}

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

  // Get the pilot ID from the response
  const data = await res.json();
  const pilotId = data.pilot_id;

  // Revalidate all pilot-related data
  await Promise.all([
    mutate(`/api/career/pilots/${pilotId}`),
    mutate(`/api/career/pilots/${pilotId}/stats`),
    mutate(`/api/career/pilots/${pilotId}/scheduled-flights`),
  ]);

  return data;
} 