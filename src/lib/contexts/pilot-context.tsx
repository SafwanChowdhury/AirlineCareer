"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Pilot, Schedule, FlightHistoryStats } from "@/lib/types";
import { useSwrFetch } from "../hooks/use-swr-fetch";

interface PilotContextType {
  pilotId: number | null;
  pilot: Pilot | null;
  pilotStats: FlightHistoryStats | null;
  currentSchedule: Schedule | null;
  setPilotId: (id: number) => void;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  loading: boolean;
  error: string | null;
}

const PilotContext = createContext<PilotContextType>({
  pilotId: null,
  pilot: null,
  pilotStats: null,
  currentSchedule: null,
  setPilotId: () => {},
  setCurrentSchedule: () => {},
  loading: false,
  error: null,
});

const STORAGE_KEY = "selectedPilotId";

export function PilotProvider({ children }: { children: React.ReactNode }) {
  // Initialize pilotId from localStorage on client
  const [pilotId, setPilotIdState] = useState<number | null>(null);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use SWR for data fetching
  const {
    data: pilotData,
    error: pilotError,
    isLoading: isPilotLoading,
  } = useSwrFetch<Pilot>(
    isInitialized && pilotId ? `/api/career/pilots/${pilotId}` : null
  );

  const {
    data: pilotStatsData,
    error: statsError,
    isLoading: isStatsLoading,
  } = useSwrFetch<FlightHistoryStats>(
    isInitialized && pilotId ? `/api/career/pilots/${pilotId}/stats` : null
  );

  // Convert undefined values to null
  const pilot = pilotData || null;
  const pilotStats = pilotStatsData || null;

  // Combine loading and error states
  const loading = isPilotLoading || isStatsLoading;
  const error = pilotError?.message || statsError?.message || null;

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedId = localStorage.getItem(STORAGE_KEY);
      if (storedId) {
        const parsedId = parseInt(storedId, 10);
        if (!isNaN(parsedId) && parsedId > 0) {
          console.log(
            `[pilot-context] Initializing from localStorage: ID ${parsedId}`
          );
          setPilotIdState(parsedId);
        }
      }
    } catch (error) {
      console.error("[pilot-context] Error loading from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Function to update pilotId in state and localStorage
  const setPilotId = (id: number) => {
    console.log(`[pilot-context] Setting pilot ID: ${id}`);
    setPilotIdState(id);

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, id.toString());
    } catch (error) {
      console.error("[pilot-context] Error saving to localStorage:", error);
    }
  };

  return (
    <PilotContext.Provider
      value={{
        pilotId,
        pilot,
        pilotStats,
        currentSchedule,
        setPilotId,
        setCurrentSchedule,
        loading,
        error,
      }}
    >
      {children}
    </PilotContext.Provider>
  );
}

export function usePilot() {
  return useContext(PilotContext);
}
