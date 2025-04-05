"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { PilotProfile } from "@/lib/types";

interface PilotContextType {
  pilotId: number | null;
  pilot: PilotProfile | null;
  setPilotId: (id: number) => void;
}

const PilotContext = createContext<PilotContextType>({
  pilotId: null,
  pilot: null,
  setPilotId: () => {},
});

const STORAGE_KEY = "selectedPilotId";

export function PilotProvider({ children }: { children: React.ReactNode }) {
  // Initialize pilotId from localStorage on client
  const [pilotId, setPilotIdState] = useState<number | null>(null);
  const [pilot, setPilot] = useState<PilotProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Fetch pilot data when pilotId changes
  useEffect(() => {
    if (!isInitialized) {
      return; // Skip the initial render before localStorage is loaded
    }

    if (pilotId && pilotId > 0) {
      console.log(`[pilot-context] Fetching pilot with ID: ${pilotId}`);

      fetch(`/api/career/pilots/${pilotId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API response error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success) {
            console.log(`[pilot-context] Pilot data loaded:`, data.data);
            setPilot(data.data);
          } else {
            console.error(`[pilot-context] Error loading pilot:`, data.error);
            setPilot(null);
          }
        })
        .catch((error) => {
          console.error(`[pilot-context] Error fetching pilot profile:`, error);
          setPilot(null);
        });
    } else {
      console.log(
        `[pilot-context] No valid pilotId (${pilotId}), setting pilot to null`
      );
      setPilot(null);
    }
  }, [pilotId, isInitialized]);

  return (
    <PilotContext.Provider value={{ pilotId, pilot, setPilotId }}>
      {children}
    </PilotContext.Provider>
  );
}

export function usePilot() {
  return useContext(PilotContext);
}
