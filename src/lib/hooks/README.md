# Hooks

This directory contains custom React hooks that provide reusable functionality across components.

## Core Hooks

### `use-swr-fetch.ts`

This is the core data fetching hook that all other data fetching hooks are built on. It uses SWR for data fetching with standardized error handling and caching.

```tsx
import { useSwrFetch } from "@/lib/hooks/use-swr-fetch";

function MyComponent() {
  const { data, error, isLoading } = useSwrFetch<MyDataType>("/api/my-endpoint");
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.name}</div>;
}
```

## Domain-Specific Hooks

### `use-pilot.ts`

Contains hooks and utilities for working with pilot data:

- `usePilotProfile`: Fetches a pilot's profile data
- `usePilotStats`: Fetches a pilot's statistics
- `usePilotHistory`: Fetches a pilot's flight history
- `useScheduledFlights`: Fetches a pilot's scheduled flights
- `createPilot`: Creates a new pilot
- `updatePilot`: Updates an existing pilot
- `updateFlightStatus`: Updates a flight's status
- `useRevalidatePilotData`: Revalidates pilot-related data after mutations

```tsx
import { usePilotProfile, usePilotStats } from "@/lib/hooks/use-pilot";

function PilotProfile({ pilotId }: { pilotId: number }) {
  const { data: pilot, error: pilotError, isLoading: pilotLoading } = usePilotProfile(pilotId);
  const { data: stats, error: statsError, isLoading: statsLoading } = usePilotStats(pilotId);
  
  const loading = pilotLoading || statsLoading;
  const error = pilotError || statsError;
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{pilot?.name}</h1>
      <p>Total Flights: {stats?.totalFlights}</p>
    </div>
  );
}
```

### `use-schedule.ts`

Contains hooks and utilities for working with schedule data:

- `useScheduleData`: Fetches a schedule's data
- `useScheduleFlights`: Fetches a schedule's flights
- `createSchedule`: Creates a new schedule
- `updateSchedule`: Updates an existing schedule
- `updateFlightStatus`: Updates a flight's status
- `useScheduleMutations`: Provides mutation functions with automatic revalidation

```tsx
import { useScheduleData, useScheduleFlights } from "@/lib/hooks/use-schedule";

function ScheduleDetails({ scheduleId }: { scheduleId: number }) {
  const { data: schedule, isLoading: scheduleLoading } = useScheduleData(scheduleId);
  const { data: flights, isLoading: flightsLoading } = useScheduleFlights(scheduleId);
  
  const loading = scheduleLoading || flightsLoading;
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{schedule?.name}</h1>
      <p>Flights: {flights?.length || 0}</p>
      <ul>
        {flights?.map(flight => (
          <li key={flight.id}>{flight.route.origin} to {flight.route.destination}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Architecture Decisions

1. **Separation of Concerns**
   - Hooks are organized by domain (pilot, schedule, etc.)
   - Each hook has a single responsibility
   - Data fetching is standardized through `useSwrFetch`

2. **Naming Conventions**
   - `use` prefix for all React hooks
   - Descriptive names that indicate what data the hook fetches
   - Mutation functions use verb names (create, update, delete)

3. **Performance**
   - SWR is used for efficient data fetching and caching
   - Revalidation is triggered automatically after mutations
   - Hooks accept configuration options for custom caching behaviors

4. **Error Handling**
   - All hooks include standardized error handling
   - Error objects include helpful messages and status codes
   - Errors are consistently typed for easier handling in components 