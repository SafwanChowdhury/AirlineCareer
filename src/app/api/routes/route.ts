// src/app/api/routes/route.ts
import { NextRequest } from "next/server";
import { routesDb } from "@/lib/db";
import { and, like, or, eq, sql } from "drizzle-orm";
import { routeDetails } from "@/lib/schema";
import { 
  handleApiError, 
  successResponse, 
  logApiError, 
  PaginationInfo 
} from '@/lib/api-utils';

/**
 * GET handler for routes API
 * Supports filtering by airline, departure, arrival, and country
 * Includes pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const airline = searchParams.get("airline");
    const departure = searchParams.get("departure");
    const arrival = searchParams.get("arrival");
    const country = searchParams.get("country");
    const maxDuration = searchParams.get("maxDuration");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Build query conditions based on search parameters
    const conditions = [];

    if (airline) {
      conditions.push(
        or(
          like(routeDetails.airlineName, `%${airline}%`),
          eq(routeDetails.airlineIata, airline)
        )
      );
    }

    if (departure) {
      conditions.push(
        or(
          eq(routeDetails.departureIata, departure),
          like(routeDetails.departureCity, `%${departure}%`)
        )
      );
    }

    if (arrival) {
      conditions.push(
        or(
          eq(routeDetails.arrivalIata, arrival),
          like(routeDetails.arrivalCity, `%${arrival}%`)
        )
      );
    }

    if (country) {
      conditions.push(
        or(
          eq(routeDetails.departureCountry, country),
          eq(routeDetails.arrivalCountry, country)
        )
      );
    }

    if (maxDuration) {
      const maxDurationValue = parseInt(maxDuration, 10);
      if (!isNaN(maxDurationValue)) {
        conditions.push(sql`${routeDetails.durationMin} <= ${maxDurationValue}`);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const [{ count }] = await routesDb
      .select({ count: sql<number>`count(*)` })
      .from(routeDetails)
      .where(whereClause);

    // Get paginated results
    const routes = await routesDb
      .select()
      .from(routeDetails)
      .where(whereClause)
      .orderBy(routeDetails.departureIata, routeDetails.arrivalIata)
      .limit(limit)
      .offset(offset);

    // Transform the data to match the expected format
    const transformedRoutes = routes.map(route => ({
      route_id: route.routeId,
      departure_iata: route.departureIata,
      departure_city: route.departureCity,
      departure_country: route.departureCountry,
      arrival_iata: route.arrivalIata,
      arrival_city: route.arrivalCity,
      arrival_country: route.arrivalCountry,
      airline_iata: route.airlineIata,
      airline_name: route.airlineName,
      distance_km: route.distanceKm,
      duration_min: route.durationMin
    }));

    // Create pagination info
    const pagination: PaginationInfo = {
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      limit
    };

    return successResponse(transformedRoutes, {
      pagination,
      message: `Retrieved ${transformedRoutes.length} routes (page ${page} of ${pagination.totalPages})`
    });
  } catch (error) {
    logApiError('routes-api', error);
    return handleApiError(error);
  }
}