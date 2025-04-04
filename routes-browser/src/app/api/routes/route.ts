// src/app/api/routes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRoutes, getRoutesCount, getRouteById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const id = url.searchParams.get('id');
    
    // If ID is provided, return specific route
    if (id && !isNaN(parseInt(id))) {
      const route = await getRouteById(parseInt(id));
      if (!route) {
        return NextResponse.json({ error: 'Route not found' }, { status: 404 });
      }
      return NextResponse.json(route);
    }
    
    // Otherwise, apply filters and return paginated results
    const filters = {
      airline: url.searchParams.get('airline') || undefined,
      departure: url.searchParams.get('departure') || undefined,
      arrival: url.searchParams.get('arrival') || undefined,
      country: url.searchParams.get('country') || undefined,
      maxDuration: url.searchParams.has('maxDuration') 
        ? parseInt(url.searchParams.get('maxDuration') || '0') 
        : undefined
    };
    
    const [routes, totalCount] = await Promise.all([
      getRoutes(page, limit, filters),
      getRoutesCount(filters)
    ]);
    
    return NextResponse.json({
      data: routes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}