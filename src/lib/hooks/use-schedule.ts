import { useSwrFetch } from './use-swr-fetch';
import { useSWRConfig } from 'swr';
import type {
  Schedule,
  ScheduledFlightWithRoute,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../types';

/**
 * Fetches a schedule by ID
 * @param scheduleId The ID of the schedule to fetch
 */
export function useScheduleData(scheduleId: number | null) {
  return useSwrFetch<Schedule>(
    scheduleId ? `/api/career/schedules/${scheduleId}` : null
  );
}

/**
 * Fetches flights for a schedule
 * @param scheduleId The ID of the schedule to fetch flights for
 */
export function useScheduleFlights(scheduleId: number | null) {
  return useSwrFetch<ScheduledFlightWithRoute[]>(
    scheduleId ? `/api/career/schedules/${scheduleId}/flights` : null
  );
}

/**
 * Creates a new schedule
 * @param data The schedule data to create
 */
export async function createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
  console.log('[schedule-hook] Creating schedule with data:', data);
  
  try {
    const response = await fetch('/api/career/schedules/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    console.log('[schedule-hook] Schedule API response:', responseData);
    
    if (!response.ok) {
      // Try to extract the error message from the response
      const errorMessage = responseData.error || 'Failed to generate schedule';
      console.error('[schedule-hook] API error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Handle the success response format
    if (responseData.success && responseData.data) {
      return responseData.data.schedule;
    } else {
      console.error('[schedule-hook] Unexpected API response format:', responseData);
      throw new Error('Unexpected response format from server');
    }
  } catch (error) {
    console.error('[schedule-hook] Error in createSchedule:', error);
    throw error;
  }
}

/**
 * Updates an existing schedule
 * @param id The ID of the schedule to update
 * @param data The schedule data to update
 */
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

/**
 * Updates the status of a flight
 * @param flightId The ID of the flight to update
 * @param status The new status for the flight
 */
export async function updateFlightStatus(
  flightId: number,
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
): Promise<any> {
  const response = await fetch(`/api/career/flights/${flightId}/status`, {
    method: 'PUT', // Changed from PATCH to PUT to match the implementation in use-pilot.ts
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error('Failed to update flight status');
  }
  
  const data = await response.json();
  return data.data || data;
}

/**
 * Hook providing mutations for schedule data with automatic revalidation
 * @param scheduleId The ID of the schedule to provide mutations for
 */
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
      const result = await updateFlightStatus(flightId, status);
      
      // Invalidate schedule data
      invalidateSchedule();
      
      // Also invalidate pilot data as location might have changed
      mutate((key) => typeof key === 'string' && key.startsWith('/api/career/pilots/'));
      
      return result;
    },
    
    update: async (data: UpdateScheduleRequest) => {
      if (!scheduleId) {
        throw new Error('Cannot update schedule without a schedule ID');
      }
      
      const result = await updateSchedule(scheduleId, data);
      invalidateSchedule();
      return result;
    }
  };
} 