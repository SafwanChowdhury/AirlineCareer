import { query } from './db';

interface HaulPreferences {
  shortHaul: number;
  mediumHaul: number;
  longHaul: number;
}

interface RouteWithDetails {
  route_id: number;
  departure_iata: string;
  arrival_iata: string;
  airline_iata: string;
  duration_min: number;
}

interface GeneratedFlight {
  route_id: number;
  departure_time: string;
  arrival_time: string;
}

const TURNAROUND_TIME_MIN = 60; // 1 hour turnaround time
const SHORT_HAUL_MAX_MIN = 180; // 3 hours
const MEDIUM_HAUL_MAX_MIN = 360; // 6 hours

function getHaulType(durationMin: number): 'short' | 'medium' | 'long' {
  if (durationMin <= SHORT_HAUL_MAX_MIN) return 'short';
  if (durationMin <= MEDIUM_HAUL_MAX_MIN) return 'medium';
  return 'long';
}

async function getAvailableRoutes(
  departureIata: string,
  airline?: string
): Promise<RouteWithDetails[]> {
  let sql = `
    SELECT route_id, departure_iata, arrival_iata, airline_iata, duration_min
    FROM route_details
    WHERE departure_iata = ?
  `;
  const params: (string)[] = [departureIata];

  if (airline) {
    sql += ' AND airline_iata = ?';
    params.push(airline);
  }

  return query(sql, params);
}

function filterRoutesByPreferences(
  routes: RouteWithDetails[],
  preferences: HaulPreferences,
  currentHaulType: 'short' | 'medium' | 'long',
  homeBase: string,
  currentLocation: string
): RouteWithDetails[] {
  // If we're on a long haul aircraft and not at home base,
  // we can only do another long haul flight
  if (currentHaulType === 'long' && currentLocation !== homeBase) {
    return routes.filter(r => getHaulType(r.duration_min) === 'long');
  }

  // If we're at home base, we can switch aircraft types
  if (currentLocation === homeBase) {
    const filteredRoutes: RouteWithDetails[] = [];
    const totalPreference = preferences.shortHaul + preferences.mediumHaul + preferences.longHaul;

    routes.forEach(route => {
      const haulType = getHaulType(route.duration_min);
      const preference = haulType === 'short' ? preferences.shortHaul :
                        haulType === 'medium' ? preferences.mediumHaul :
                        preferences.longHaul;

      // Add routes based on preference percentage
      if (Math.random() < (preference / totalPreference)) {
        filteredRoutes.push(route);
      }
    });

    return filteredRoutes.length > 0 ? filteredRoutes : routes;
  }

  // If we're on short/medium haul aircraft, we can do either
  return routes.filter(r => {
    const haulType = getHaulType(r.duration_min);
    return haulType === 'short' || haulType === 'medium';
  });
}

export async function generateSchedule(
  startLocation: string,
  endLocation: string,
  durationDays: number,
  airline: string | undefined,
  preferences: HaulPreferences,
  homeBase: string
): Promise<GeneratedFlight[]> {
  const flights: GeneratedFlight[] = [];
  let currentLocation = startLocation;
  let currentTime = new Date();
  let currentHaulType: 'short' | 'medium' | 'long' = 'short';
  const endTime = new Date(currentTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

  while (currentTime < endTime) {
    // Get available routes from current location
    const routes = await getAvailableRoutes(currentLocation, airline);
    if (routes.length === 0) {
      throw new Error(`No routes available from ${currentLocation}`);
    }

    // Filter routes based on preferences and constraints
    const filteredRoutes = filterRoutesByPreferences(
      routes,
      preferences,
      currentHaulType,
      homeBase,
      currentLocation
    );

    if (filteredRoutes.length === 0) {
      throw new Error(`No suitable routes found from ${currentLocation}`);
    }

    // If we're approaching the end time, try to find a route to the end location
    const timeLeft = endTime.getTime() - currentTime.getTime();
    if (timeLeft <= 24 * 60 * 60 * 1000) { // Less than 24 hours left
      const routeToEnd = filteredRoutes.find(r => r.arrival_iata === endLocation);
      if (routeToEnd) {
        const flight: GeneratedFlight = {
          route_id: routeToEnd.route_id,
          departure_time: currentTime.toISOString(),
          arrival_time: new Date(currentTime.getTime() + routeToEnd.duration_min * 60 * 1000).toISOString()
        };
        flights.push(flight);
        break;
      }
    }

    // Select a random route from filtered routes
    const selectedRoute = filteredRoutes[Math.floor(Math.random() * filteredRoutes.length)];
    
    // Add flight to schedule
    const flight: GeneratedFlight = {
      route_id: selectedRoute.route_id,
      departure_time: currentTime.toISOString(),
      arrival_time: new Date(currentTime.getTime() + selectedRoute.duration_min * 60 * 1000).toISOString()
    };
    flights.push(flight);

    // Update current location and time
    currentLocation = selectedRoute.arrival_iata;
    currentTime = new Date(currentTime.getTime() + (selectedRoute.duration_min + TURNAROUND_TIME_MIN) * 60 * 1000);
    currentHaulType = getHaulType(selectedRoute.duration_min);
  }

  // If we couldn't reach the end location, throw an error
  if (currentLocation !== endLocation) {
    throw new Error(`Could not generate a schedule that ends at ${endLocation}`);
  }

  return flights;
} 