// src/app/api/airports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAirports, getCountries, getMaxDuration } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type');
    
    if (type === 'countries') {
      const countries = await getCountries();
      return NextResponse.json(countries);
    }
    
    if (type === 'maxDuration') {
      const maxDuration = await getMaxDuration();
      return NextResponse.json({ maxDuration });
    }
    
    const airports = await getAirports();
    return NextResponse.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports' },
      { status: 500 }
    );
  }
}