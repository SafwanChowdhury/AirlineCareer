import { db } from './db';
import { eq, and, sql } from 'drizzle-orm';
import { routeDetails } from './schema';
import type { RouteDetail } from './types';

interface GenerateScheduleOptions {
  startLocation: string;
  endLocation: string;
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
  const {
    startLocation,
    endLocation,
    durationDays,
    haulPreferences = 'any',
    preferredAirline,
    maxLayoverHours = 4
  } = options;

  // Calculate time constraints
  const totalMinutesAvailable = durationDays * 24 * 60;
  const maxLayoverMinutes = maxLayoverHours * 60;

  // Get all possible routes from start location
  const possibleRoutes = await findPossibleRoutes(
    startLocation,
    endLocation,
    haulPreferences,
    preferredAirline
  );

  // Score and sort routes based on preferences
  const scoredRoutes = scoreRoutes(possibleRoutes, {
    haulPreferences,
    preferredAirline
  });

  // Generate optimal schedule
  return optimizeSchedule(
    scoredRoutes,
    totalMinutesAvailable,
    maxLayoverMinutes
  );
}

async function findPossibleRoutes(
  startLocation: string,
  endLocation: string,
  haulPreference: string,
  preferredAirline?: string
): Promise<RouteDetail[]> {
  let query = db
    .select()
    .from(routeDetails)
    .where(eq(routeDetails.departureIata, startLocation));

  // Apply haul type filter
  if (haulPreference !== 'any') {
    const { min, max } = HAUL_TYPES[haulPreference as keyof typeof HAUL_TYPES];
    query = query.where(
      and(
        sql`${routeDetails.durationMin} >= ${min}`,
        sql`${routeDetails.durationMin} < ${max}`
      )
    );
  }

  // Apply airline preference
  if (preferredAirline) {
    query = query.where(eq(routeDetails.airlineIata, preferredAirline));
  }

  return query;
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

function optimizeSchedule(
  scoredRoutes: RouteWithScore[],
  totalMinutesAvailable: number,
  maxLayoverMinutes: number
): RouteDetail[] {
  const schedule: RouteDetail[] = [];
  let currentTime = 0;
  let currentLocation = scoredRoutes[0].route.departureIata;

  while (currentTime < totalMinutesAvailable && scoredRoutes.length > 0) {
    // Find next best route from current location
    const nextRouteIndex = scoredRoutes.findIndex(
      ({ route }) => route.departureIata === currentLocation
    );

    if (nextRouteIndex === -1) break;

    const { route } = scoredRoutes[nextRouteIndex];
    const flightTime = route.durationMin;
    const layoverTime = Math.min(maxLayoverMinutes, 120); // Default 2-hour layover

    if (currentTime + flightTime + layoverTime <= totalMinutesAvailable) {
      schedule.push(route);
      currentTime += flightTime + layoverTime;
      currentLocation = route.arrivalIata;
      scoredRoutes.splice(nextRouteIndex, 1);
    } else {
      break;
    }
  }

  return schedule;
} 