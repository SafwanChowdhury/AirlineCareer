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

export function PilotProvider({ children }: { children: React.ReactNode }) {
  const [pilotId, setPilotId] = useState<number | null>(1); // Default to pilot ID 1 for now
  const [pilot, setPilot] = useState<PilotProfile | null>(null);

  useEffect(() => {
    if (pilotId) {
      fetch(`/api/career/pilots/${pilotId}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setPilot(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching pilot profile:", error);
        });
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
