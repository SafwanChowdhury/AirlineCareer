// src/lib/schedule-generator.ts
/**
 * Schedule generator utility
 * Creates flight schedules based on specified parameters
 */
import { routesDb } from './db';
import { eq, and, sql, SQL } from 'drizzle-orm';
import { routeDetails, airports } from './schema';
import type { RouteDetail } from './types';

/**
 * Options for schedule generation
 */
export interface GenerateScheduleOptions {
  startLocation: string;
  endLocation?: string;
  durationDays: number;
  haulPreferences?: 'short' | 'medium' | 'long' | 'any';
  preferredAirline?: string;
  maxLayoverHours?: number;
}

/**
 * Route with scoring information for selection
 */
interface RouteWithScore {
  route: RouteDetail;
  score: number;
}

/**
 * Flight distance categories
 */
const HAUL_TYPES = {
  short: { min: 0, max: 180 },      // 0-3 hours
  medium: { min: 180, max: 360 },   // 3-6 hours
  long: { min: 360, max: Infinity } // 6+ hours
};

/**
 * Generate a flight schedule based on provided options
 * @param options Schedule generation options
 * @returns Array of route details for the schedule
 */
export async function generateSchedule(options: GenerateScheduleOptions): Promise<RouteDetail[]> {
  console.log("[schedule-generator] Starting schedule generation with options:", options);
  
  const {
    startLocation,
    durationDays,
    haulPreferences = 'any',
    preferredAirline,
    maxLayoverHours = 4
  } = options;

  // Store final destination (used for return trip)
  const finalDestination = options.endLocation || startLocation;

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
      // Try to find a route back to final destination
      const returnRoutes = await findPossibleRoutes(
        currentLocation,
        finalDestination,
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
      // Try to find a route back to final destination
      const returnRoutes = await findPossibleRoutes(
        currentLocation,
        finalDestination,
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

/**
 * Find possible routes based on parameters
 * @param startLocation Departure IATA code
 * @param endLocation Arrival IATA code (optional)
 * @param haulPreference Flight duration preference
 * @param preferredAirline Preferred airline IATA code (optional)
 * @returns Array of matching routes
 */
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

  // Create an array of all conditions
  const conditions: SQL<unknown>[] = [eq(routeDetails.departureIata, startLocation)];

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
      sql`${routeDetails.durationMin} >= ${min}`
    );
    conditions.push(
      sql`${routeDetails.durationMin} < ${max}`
    );
  }

  // Apply airline preference
  if (preferredAirline) {
    conditions.push(eq(routeDetails.airlineIata, preferredAirline));
  }

  // Instead of using `and()`, which requires at least one condition,
  // we'll build the query step by step
  let routes: RouteDetail[] = [];
  
  try {
    routes = await routesDb
      .select()
      .from(routeDetails)
      .where(and(...conditions))
      .limit(100);
  } catch (error) {
    console.error(`[schedule-generator] Error finding routes:`, error);
    return [];
  }

  return routes;
}

/**
 * Score routes based on preferences
 * @param routes Array of routes to score
 * @param preferences User preferences
 * @returns Array of routes with scores
 */
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