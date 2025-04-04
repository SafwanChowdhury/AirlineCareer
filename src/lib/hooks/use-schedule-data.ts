import { useSwrFetch } from './use-swr-fetch';
import type {
  Schedule,
  ScheduledFlightWithRoute,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../types';
import { useSWRConfig } from 'swr';

export function useSchedule(scheduleId: number | null) {
  return useSwrFetch<Schedule>(
    scheduleId ? `/api/career/schedules/${scheduleId}` : null
  );
}

export function useScheduleFlights(scheduleId: number | null) {
  return useSwrFetch<ScheduledFlightWithRoute[]>(
    scheduleId ? `/api/career/schedules/${scheduleId}/flights` : null
  );
}

export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  const response = await fetch('/api/career/schedules/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to generate schedule');
  }

  const json = await response.json();
  return json.data;
}

export async function updateSchedule(id: number, data: UpdateScheduleRequest): Promise<Schedule> {
  const response = await fetch(`/api/career/schedules/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update schedule');
  }

  const json = await response.json();
  return json.data;
}

export async function updateFlightStatus(
  flightId: number,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
): Promise<void> {
  const response = await fetch(`/api/career/flights/${flightId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error('Failed to update flight status');
  }
}

export function useScheduleMutations(scheduleId: number | null) {
  const { mutate } = useSWRConfig();

  const invalidateSchedule = () => {
    if (scheduleId) {
      mutate(`/api/career/schedules/${scheduleId}`);
      mutate(`/api/career/schedules/${scheduleId}/flights`);
    }
  };

  return {
    updateStatus: async (flightId: number, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
      await updateFlightStatus(flightId, status);
      invalidateSchedule();
      // Also invalidate pilot data as location might have changed
      mutate((key) => typeof key === 'string' && key.startsWith('/api/career/pilots/'));
    }
  };
} 