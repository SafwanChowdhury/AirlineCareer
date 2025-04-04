// src/app/api/routes/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { and, like, or, eq, sql } from "drizzle-orm";
import { routeDetails } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const airline = searchParams.get("airline");
    const departure = searchParams.get("departure");
    const arrival = searchParams.get("arrival");
    const country = searchParams.get("country");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (airline) {
      conditions.push(like(routeDetails.airlineName, `%${airline}%`));
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(routeDetails)
      .where(whereClause);

    // Get paginated results
    const routes = await db
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

    return NextResponse.json({
      data: transformedRoutes,
      pagination: {
        totalCount: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Failed to fetch routes" },
      { status: 500 }
    );
  }
}