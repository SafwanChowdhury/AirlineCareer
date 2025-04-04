import { useSwrFetch } from './use-swr-fetch';
import type { 
  Pilot, 
  FlightHistoryStats, 
  FlightHistoryWithRoute,
  CreatePilotRequest,
  UpdatePilotRequest
} from '../types';

export function usePilotData(pilotId: number | null) {
  return useSwrFetch<Pilot>(
    pilotId ? `/api/career/pilots/${pilotId}` : null
  );
}

export function usePilotStats(pilotId: number | null) {
  return useSwrFetch<FlightHistoryStats>(
    pilotId ? `/api/career/pilots/${pilotId}/stats` : null
  );
}

export function usePilotHistory(pilotId: number | null) {
  return useSwrFetch<FlightHistoryWithRoute[]>(
    pilotId ? `/api/career/pilots/${pilotId}/history` : null
  );
}

export async function createPilot(data: CreatePilotRequest): Promise<Pilot> {
  const response = await fetch('/api/career/pilots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create pilot');
  }
  
  const json = await response.json();
  return json.data;
}

export async function updatePilot(id: number, data: UpdatePilotRequest): Promise<Pilot> {
  const response = await fetch(`/api/career/pilots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update pilot');
  }
  
  const json = await response.json();
  return json.data;
} 