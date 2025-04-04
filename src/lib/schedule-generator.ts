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

function selectRouteBasedOnPreferences(
  routes: RouteWithDetails[],
  preferences: HaulPreferences,
  currentHaulType: 'short' | 'medium' | 'long',
  homeBase: string,
  currentLocation: string,
  remainingTime: number
): RouteWithDetails | null {
  // If we're on a long haul aircraft and not at home base,
  // we can only do another long haul flight
  if (currentHaulType === 'long' && currentLocation !== homeBase) {
    const longHaulRoutes = routes.filter(r => getHaulType(r.duration_min) === 'long');
    return longHaulRoutes.length > 0 ? 
      longHaulRoutes[Math.floor(Math.random() * longHaulRoutes.length)] : null;
  }

  // Group routes by haul type
  const routesByType = {
    short: routes.filter(r => getHaulType(r.duration_min) === 'short'),
    medium: routes.filter(r => getHaulType(r.duration_min) === 'medium'),
    long: routes.filter(r => getHaulType(r.duration_min) === 'long')
  };

  // If at home base, we can switch aircraft types
  if (currentLocation === homeBase) {
    // Calculate probability for each haul type
    const total = preferences.shortHaul + preferences.mediumHaul + preferences.longHaul;
    const rand = Math.random() * total;
    
    let selectedRoutes: RouteWithDetails[];
    if (rand < preferences.shortHaul) {
      selectedRoutes = routesByType.short;
    } else if (rand < preferences.shortHaul + preferences.mediumHaul) {
      selectedRoutes = routesByType.medium;
    } else {
      selectedRoutes = routesByType.long;
    }

    return selectedRoutes.length > 0 ? 
      selectedRoutes[Math.floor(Math.random() * selectedRoutes.length)] : null;
  }

  // If we're on short/medium haul aircraft, we can do either
  if (currentHaulType === 'short' || currentHaulType === 'medium') {
    const availableRoutes = [...routesByType.short, ...routesByType.medium];
    return availableRoutes.length > 0 ?
      availableRoutes[Math.floor(Math.random() * availableRoutes.length)] : null;
  }

  return null;
}

export async function generateSchedule(
  startLocation: string,
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

    // Calculate remaining time
    const remainingTime = endTime.getTime() - currentTime.getTime();
    const remainingHours = remainingTime / (60 * 60 * 1000);

    // If we're approaching the end time, try to find a route back to home base
    if (remainingHours <= 12 && currentLocation !== homeBase) {
      const routeToHome = routes.find(r => r.arrival_iata === homeBase);
      if (routeToHome) {
        const flight: GeneratedFlight = {
          route_id: routeToHome.route_id,
          departure_time: currentTime.toISOString(),
          arrival_time: new Date(currentTime.getTime() + routeToHome.duration_min * 60 * 1000).toISOString()
        };
        flights.push(flight);
        break;
      }
    }

    // Select next route based on preferences
    const selectedRoute = selectRouteBasedOnPreferences(
      routes,
      preferences,
      currentHaulType,
      homeBase,
      currentLocation,
      remainingTime
    );

    if (!selectedRoute) {
      // If we can't find a suitable route, try to return to home base
      const routeToHome = routes.find(r => r.arrival_iata === homeBase);
      if (routeToHome) {
        const flight: GeneratedFlight = {
          route_id: routeToHome.route_id,
          departure_time: currentTime.toISOString(),
          arrival_time: new Date(currentTime.getTime() + routeToHome.duration_min * 60 * 1000).toISOString()
        };
        flights.push(flight);
        break;
      }
      throw new Error(`No suitable routes found from ${currentLocation}`);
    }

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

  return flights;
} 