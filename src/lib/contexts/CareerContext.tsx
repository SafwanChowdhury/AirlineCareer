import { createContext, useContext, useEffect, useState } from "react";
import { PilotProfile } from "../types";

interface CareerContextType {
  currentPilotId: number | null;
  currentPilot: PilotProfile | null;
  setCurrentPilotId: (id: number | null) => void;
  loading: boolean;
  error: string | null;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [currentPilotId, setCurrentPilotId] = useState<number | null>(() => {
    // Try to get the pilot ID from local storage
    const stored = localStorage.getItem("currentPilotId");
    return stored ? parseInt(stored, 10) : null;
  });
  const [currentPilot, setCurrentPilot] = useState<PilotProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Save pilot ID to local storage whenever it changes
    if (currentPilotId) {
      localStorage.setItem("currentPilotId", currentPilotId.toString());
    } else {
      localStorage.removeItem("currentPilotId");
    }

    // Fetch pilot profile when ID changes
    async function fetchPilot() {
      if (!currentPilotId) {
        setCurrentPilot(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/career/pilots/${currentPilotId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch pilot profile");
        }
        const data = await response.json();
        setCurrentPilot(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setCurrentPilot(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPilot();
  }, [currentPilotId]);

  return (
    <CareerContext.Provider
      value={{
        currentPilotId,
        currentPilot,
        setCurrentPilotId,
        loading,
        error,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (context === undefined) {
    throw new Error("useCareer must be used within a CareerProvider");
  }
  return context;
}
