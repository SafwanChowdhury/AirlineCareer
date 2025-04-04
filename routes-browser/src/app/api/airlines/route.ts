// src/app/api/airlines/route.ts
import { NextResponse } from 'next/server';
import { getAirlines } from '@/lib/db';

export async function GET() {
  try {
    const airlines = await getAirlines();
    return NextResponse.json(airlines);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airlines' },
      { status: 500 }
    );
  }
}
