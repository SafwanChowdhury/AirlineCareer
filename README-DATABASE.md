# Airline Routes Database Structure

This application uses two separate SQLite databases:

1. `routes.db` - Reference database with airline, airport, and route information
2. `career.db` - Game state database with player progress and flight history

## Database Structure

### routes.db (Reference Data)

This database contains all the reference data needed for the application. It is essentially read-only for the application's main functionality.

Tables:
- **airlines**: Information about airlines
  - `iata` (TEXT, PRIMARY KEY): Airline IATA code
  - `name` (TEXT): Airline name

- **airports**: Information about airports
  - `iata` (TEXT, PRIMARY KEY): Airport IATA code
  - `name` (TEXT): Airport name
  - `city_name` (TEXT): City name
  - `country` (TEXT): Country name
  - `latitude` (TEXT): Latitude coordinate
  - `longitude` (TEXT): Longitude coordinate

- **route_details**: Information about airline routes
  - `route_id` (INTEGER, PRIMARY KEY): Unique route identifier
  - `departure_iata` (TEXT): Departure airport IATA code
  - `departure_city` (TEXT): Departure city name
  - `departure_country` (TEXT): Departure country name
  - `arrival_iata` (TEXT): Arrival airport IATA code
  - `arrival_city` (TEXT): Arrival city name
  - `arrival_country` (TEXT): Arrival country name
  - `distance_km` (INTEGER): Distance in kilometers
  - `duration_min` (INTEGER): Duration in minutes
  - `airline_iata` (TEXT): Airline IATA code
  - `airline_name` (TEXT): Airline name

### career.db (Game State)

This database contains all player progress and game state information.

Tables:
- **pilots**: Information about player pilots
  - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique pilot identifier
  - `name` (TEXT): Pilot name
  - `home_base` (TEXT): Pilot's home airport
  - `current_location` (TEXT): Current airport location
  - `preferred_airline` (TEXT): Preferred airline (optional)
  - `created_at` (TEXT): Creation timestamp
  - `updated_at` (TEXT): Last update timestamp

- **schedules**: Flight schedules for pilots
  - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique schedule identifier
  - `pilot_id` (INTEGER): Reference to pilot ID
  - `name` (TEXT): Schedule name
  - `start_location` (TEXT): Starting airport
  - `duration_days` (INTEGER): Schedule duration in days
  - `haul_preferences` (TEXT): Haul preferences (optional)
  - `created_at` (TEXT): Creation timestamp
  - `updated_at` (TEXT): Last update timestamp

- **route_details**: Mirror of route details from routes.db for reference purposes
  - (Same structure as in routes.db)

- **scheduled_flights**: Flights scheduled for pilots
  - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique flight identifier
  - `schedule_id` (INTEGER): Reference to schedule ID
  - `route_id` (INTEGER): Reference to route ID (in routes.db)
  - `sequence_order` (INTEGER): Order in the schedule
  - `departure_time` (TEXT): Scheduled departure time
  - `arrival_time` (TEXT): Scheduled arrival time
  - `status` (TEXT): Flight status (scheduled, completed, cancelled)

- **flight_history**: Completed flights history
  - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT): Unique history entry identifier
  - `pilot_id` (INTEGER): Reference to pilot ID
  - `route_id` (INTEGER): Reference to route ID (in routes.db)
  - `departure_time` (TEXT): Actual departure time
  - `arrival_time` (TEXT): Actual arrival time
  - `departure_location` (TEXT): Departure airport code
  - `arrival_location` (TEXT): Arrival airport code
  - `airline_iata` (TEXT): Airline IATA code
  - `flight_duration_min` (INTEGER): Flight duration in minutes
  - `status` (TEXT): Flight status (completed, partial, aborted)

## Database Setup

To initialize the databases, you can use the following API endpoints:

1. `/api/migrate` - Initialize both databases with the correct schema
   - Optional query parameter `?db=routes` to initialize only routes.db
   - Optional query parameter `?db=career` to initialize only career.db

2. `/api/sync-routes` - Sync route data from routes.db to career.db
   - This ensures that the route_details table in career.db is up-to-date with routes.db

## Foreign Key References

Note that the scheduled_flights and flight_history tables in career.db reference route_ids in routes.db. To ensure referential integrity, we maintain a mirror of the route_details table in career.db.

## Scripts

- `src/lib/migrate-all.ts` - Script to initialize database schemas
- `src/lib/sync-routes.ts` - Script to sync route data between databases

## API Structure

The API is set up to use the appropriate database for each endpoint:
- Routes-related API endpoints use `routesDb` to access routes.db
- Career-related API endpoints use `db` to access career.db 