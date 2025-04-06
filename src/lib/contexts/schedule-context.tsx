"use client";

import { createContext, useContext, useState } from "react";
import { Schedule, ScheduledFlightWithRoute } from "@/lib/types";
import { useSwrFetch } from "../hooks/use-swr-fetch";

interface ScheduleContextType {
  scheduleId: number | null;
  schedule: Schedule | null;
  flights: ScheduledFlightWithRoute[] | null;
  setScheduleId: (id: number | null) => void;
  loading: boolean;
  error: string | null;
}

const ScheduleContext = createContext<ScheduleContextType>({
  scheduleId: null,
  schedule: null,
  flights: null,
  setScheduleId: () => {},
  loading: false,
  error: null,
});

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [scheduleId, setScheduleId] = useState<number | null>(null);

  // Use SWR for data fetching
  const {
    data: scheduleData,
    error: scheduleError,
    isLoading: isScheduleLoading,
  } = useSwrFetch<Schedule>(
    scheduleId ? `/api/career/schedules/${scheduleId}` : null
  );

  const {
    data: flightsData,
    error: flightsError,
    isLoading: isFlightsLoading,
  } = useSwrFetch<ScheduledFlightWithRoute[]>(
    scheduleId ? `/api/career/schedules/${scheduleId}/flights` : null
  );

  // Convert undefined values to null
  const schedule = scheduleData || null;
  const flights = flightsData || null;

  // Combine loading and error states
  const loading = isScheduleLoading || isFlightsLoading;
  const error = scheduleError?.message || flightsError?.message || null;

  return (
    <ScheduleContext.Provider
      value={{
        scheduleId,
        schedule,
        flights,
        setScheduleId,
        loading,
        error,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
