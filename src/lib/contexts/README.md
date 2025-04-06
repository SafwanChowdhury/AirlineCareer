# Contexts

This directory contains React contexts that manage global state for the application.

## Available Contexts

### PilotContext (`pilot-context.tsx`)

The `PilotContext` manages the currently selected pilot and related data:

- `pilotId`: The ID of the currently selected pilot (persisted in localStorage)
- `pilot`: The full pilot data object
- `pilotStats`: The pilot's flight statistics
- `currentSchedule`: The currently viewed schedule
- `loading`: Whether any of the pilot data is currently loading
- `error`: Any error that occurred while loading pilot data

Usage:

```tsx
import { usePilot } from "@/lib/contexts/pilot-context";

function MyComponent() {
  const { pilotId, pilot, pilotStats, loading, error, setPilotId } = usePilot();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!pilot) return <div>No pilot selected</div>;
  
  return (
    <div>
      <h1>Pilot: {pilot.name}</h1>
      <p>Total flights: {pilotStats?.totalFlights || 0}</p>
      <button onClick={() => setPilotId(123)}>Select pilot 123</button>
    </div>
  );
}
```

### ScheduleContext (`schedule-context.tsx`)

The `ScheduleContext` manages the currently selected schedule and related data:

- `scheduleId`: The ID of the currently selected schedule
- `schedule`: The full schedule data object
- `flights`: The flights associated with the schedule
- `loading`: Whether any of the schedule data is currently loading
- `error`: Any error that occurred while loading schedule data

Usage:

```tsx
import { useSchedule } from "@/lib/contexts/schedule-context";

function MyComponent() {
  const { scheduleId, schedule, flights, loading, error, setScheduleId } = useSchedule();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!schedule) return <div>No schedule selected</div>;
  
  return (
    <div>
      <h1>Schedule: {schedule.name}</h1>
      <p>Total flights: {flights?.length || 0}</p>
      <button onClick={() => setScheduleId(123)}>Select schedule 123</button>
    </div>
  );
}
```

## Architecture Decisions

1. **State Management**: Contexts are used to manage global state that needs to be accessed by multiple components.

2. **Data Fetching**: SWR is used within contexts to handle data fetching, with automatic revalidation.

3. **Error Handling**: All contexts include standardized error handling.

4. **Loading States**: All contexts include loading states to help with UI feedback.

5. **Context Boundaries**: 
   - `PilotContext` is responsible for pilot-related state
   - `ScheduleContext` is responsible for schedule-related state 