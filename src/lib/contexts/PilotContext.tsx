"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Pilot, Schedule, FlightHistoryStats } from "../types";
import { ApiError } from "../api-utils";

interface PilotContextValue {
  pilot: Pilot | null;
  currentSchedule: Schedule | null;
  pilotStats: FlightHistoryStats | null;
  setPilot: (pilot: Pilot | null) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  loading: boolean;
  error: string | null;
}

const PilotContext = createContext<PilotContextValue>({
  pilot: null,
  currentSchedule: null,
  pilotStats: null,
  setPilot: () => {},
  setCurrentSchedule: () => {},
  loading: false,
  error: null,
});

export function PilotProvider({ children }: { children: React.ReactNode }) {
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [pilotStats, setPilotStats] = useState<FlightHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pilot stats when pilot changes
  useEffect(() => {
    if (!pilot) {
      setPilotStats(null);
      return;
    }

    async function fetchPilotStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/career/pilots/${pilot.id}/stats`);
        if (!response.ok) {
          throw new ApiError("Failed to fetch pilot stats", response.status);
        }
        const data = await response.json();
        setPilotStats(data.data);
      } catch (err) {
        console.error("Error fetching pilot stats:", err);
        setError(
          err instanceof ApiError ? err.message : "Failed to fetch pilot stats"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPilotStats();
  }, [pilot]);

  const value = {
    pilot,
    currentSchedule,
    pilotStats,
    setPilot,
    setCurrentSchedule,
    loading,
    error,
  };

  return (
    <PilotContext.Provider value={value}>{children}</PilotContext.Provider>
  );
}

export function usePilot() {
  const context = useContext(PilotContext);
  if (!context) {
    throw new Error("usePilot must be used within a PilotProvider");
  }
  return context;
}
