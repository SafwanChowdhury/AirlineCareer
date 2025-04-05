import { routesDb } from './db';
import { eq, and, sql } from 'drizzle-orm';
import { routeDetails, airports } from './schema';
import type { RouteDetail } from './types';

interface GenerateScheduleOptions {
  startLocation: string;
  endLocation?: string;
  durationDays: number;
  haulPreferences?: 'short' | 'medium' | 'long' | 'any';
  preferredAirline?: string;
  maxLayoverHours?: number;
}

interface RouteWithScore {
  route: RouteDetail;
  score: number;
}

const HAUL_TYPES = {
  short: { min: 0, max: 180 }, // 0-3 hours
  medium: { min: 180, max: 360 }, // 3-6 hours
  long: { min: 360, max: Infinity } // 6+ hours
};

export async function generateSchedule(options: GenerateScheduleOptions): Promise<RouteDetail[]> {
  console.log("[schedule-generator] Starting schedule generation with options:", options);
  
  const {
    startLocation,
    endLocation = startLocation, // Default to returning to start location
    durationDays,
    haulPreferences = 'any',
    preferredAirline,
    maxLayoverHours = 4
  } = options;

  // Calculate time constraints
  const totalMinutesAvailable = durationDays * 24 * 60;
  const maxLayoverMinutes = maxLayoverHours * 60;

  console.log("[schedule-generator] Finding possible routes...");
  // Get all possible routes from start location
  const outboundRoutes = await findPossibleRoutes(
    startLocation,
    null,
    haulPreferences,
    preferredAirline
  );
  
  console.log("[schedule-generator] Found outbound routes:", outboundRoutes.length);

  if (outboundRoutes.length === 0) {
    console.log("[schedule-generator] No outbound routes found");
    return [];
  }

  // Score and sort routes based on preferences
  console.log("[schedule-generator] Scoring routes...");
  const scoredOutboundRoutes = scoreRoutes(outboundRoutes, {
    haulPreferences,
    preferredAirline
  });

  // Find return routes for each destination
  const schedule: RouteDetail[] = [];
  let currentTime = 0;
  let currentLocation = startLocation;

  while (currentTime < totalMinutesAvailable && scoredOutboundRoutes.length > 0) {
    // Find next best route from current location
    const nextRouteIndex = scoredOutboundRoutes.findIndex(
      ({ route }) => route.departureIata === currentLocation
    );

    if (nextRouteIndex === -1) {
      // Try to find a route back to start location
      const returnRoutes = await findPossibleRoutes(
        currentLocation,
        startLocation,
        haulPreferences,
        preferredAirline
      );

      if (returnRoutes.length > 0) {
        const returnRoute = returnRoutes[0];
        const totalTime = currentTime + returnRoute.durationMin;
        
        if (totalTime <= totalMinutesAvailable) {
          schedule.push(returnRoute);
        }
      }
      break;
    }

    const { route } = scoredOutboundRoutes[nextRouteIndex];
    const flightTime = route.durationMin;
    const layoverTime = Math.min(maxLayoverMinutes, 120); // Default 2-hour layover

    if (currentTime + flightTime + layoverTime <= totalMinutesAvailable) {
      schedule.push(route);
      currentTime += flightTime + layoverTime;
      currentLocation = route.arrivalIata;
      scoredOutboundRoutes.splice(nextRouteIndex, 1);
    } else {
      // Try to find a route back to start location
      const returnRoutes = await findPossibleRoutes(
        currentLocation,
        startLocation,
        haulPreferences,
        preferredAirline
      );

      if (returnRoutes.length > 0) {
        const returnRoute = returnRoutes[0];
        const totalTime = currentTime + returnRoute.durationMin;
        
        if (totalTime <= totalMinutesAvailable) {
          schedule.push(returnRoute);
        }
      }
      break;
    }
  }

  console.log("[schedule-generator] Final schedule length:", schedule.length);
  return schedule;
}

async function findPossibleRoutes(
  startLocation: string,
  endLocation: string | null,
  haulPreference: string,
  preferredAirline?: string
): Promise<RouteDetail[]> {
  // First verify the airport exists in routes database
  const startAirport = await routesDb
    .select()
    .from(airports)
    .where(eq(airports.iata, startLocation))
    .limit(1);

  if (!startAirport[0]) {
    console.error(`[schedule-generator] Invalid start location: ${startLocation}`);
    return [];
  }

  let conditions = [eq(routeDetails.departureIata, startLocation)];

  // Add end location condition if specified
  if (endLocation) {
    const endAirport = await routesDb
      .select()
      .from(airports)
      .where(eq(airports.iata, endLocation))
      .limit(1);

    if (!endAirport[0]) {
      console.error(`[schedule-generator] Invalid end location: ${endLocation}`);
      return [];
    }
    conditions.push(eq(routeDetails.arrivalIata, endLocation));
  }

  // Apply haul type filter
  if (haulPreference !== 'any') {
    const { min, max } = HAUL_TYPES[haulPreference as keyof typeof HAUL_TYPES];
    conditions.push(
      and(
        sql`${routeDetails.durationMin} >= ${min}`,
        sql`${routeDetails.durationMin} < ${max}`
      )
    );
  }

  // Apply airline preference
  if (preferredAirline) {
    conditions.push(eq(routeDetails.airlineIata, preferredAirline));
  }

  const routes = await routesDb
    .select()
    .from(routeDetails)
    .where(and(...conditions));

  return routes;
}

function scoreRoutes(
  routes: RouteDetail[],
  preferences: { haulPreferences: string; preferredAirline?: string }
): RouteWithScore[] {
  return routes.map(route => {
    let score = 0;

    // Score based on haul type match
    if (preferences.haulPreferences !== 'any') {
      const { min, max } = HAUL_TYPES[preferences.haulPreferences as keyof typeof HAUL_TYPES];
      if (route.durationMin >= min && route.durationMin < max) {
        score += 2;
      }
    }

    // Score based on airline preference
    if (preferences.preferredAirline && route.airlineIata === preferences.preferredAirline) {
      score += 1;
    }

    return { route, score };
  }).sort((a, b) => b.score - a.score);
} 