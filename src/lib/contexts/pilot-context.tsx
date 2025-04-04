"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { PilotProfile } from "@/lib/types";

interface PilotContextType {
  pilotId: number | null;
  pilot: PilotProfile | null;
  setPilotId: (id: number | null) => void;
}

const PilotContext = createContext<PilotContextType>({
  pilotId: null,
  pilot: null,
  setPilotId: () => {},
});

export function PilotProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage if available
  const [pilotId, setPilotId] = useState<number | null>(() => {
    // Only run in client-side
    if (typeof window !== "undefined") {
      const savedPilotId = localStorage.getItem("currentPilotId");
      return savedPilotId ? parseInt(savedPilotId, 10) : null;
    }
    return null;
  });
  const [pilot, setPilot] = useState<PilotProfile | null>(null);

  // Save pilotId to localStorage when it changes
  useEffect(() => {
    if (pilotId) {
      localStorage.setItem("currentPilotId", pilotId.toString());
    } else {
      localStorage.removeItem("currentPilotId");
    }
  }, [pilotId]);

  // Fetch pilot data when pilotId changes
  useEffect(() => {
    if (pilotId) {
      fetch(`/api/career/pilots/${pilotId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setPilot(data);
          } else {
            console.error("Error fetching pilot:", data.error);
            setPilot(null);
            // Reset pilotId if pilot not found
            if (data.error === "Pilot not found") {
              setPilotId(null);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching pilot profile:", error);
          setPilot(null);
        });
    } else {
      setPilot(null);
    }
  }, [pilotId]);

  return (
    <PilotContext.Provider value={{ pilotId, pilot, setPilotId }}>
      {children}
    </PilotContext.Provider>
  );
}

export function usePilot() {
  const context = useContext(PilotContext);
  if (!context) {
    throw new Error("usePilot must be used within a PilotProvider");
  }
  return context;
}
