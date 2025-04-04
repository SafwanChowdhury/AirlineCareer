import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { pilots } from "@/lib/schema";

export async function GET() {
  try {
    const allPilots = await db.query.pilots.findMany({
      orderBy: (pilots, { asc }) => [asc(pilots.name)],
    });

    return NextResponse.json(allPilots);
  } catch (error) {
    console.error("Error fetching pilots:", error);
    return NextResponse.json(
      { error: "Failed to fetch pilots" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newPilot] = await db.insert(pilots).values({
      name: body.name,
      homeBase: body.homeBase,
      currentLocation: body.homeBase,
      preferredAirline: body.preferredAirline || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(newPilot);
  } catch (error) {
    console.error("Error creating pilot:", error);
    return NextResponse.json(
      { error: "Failed to create pilot" },
      { status: 500 }
    );
  }
} 