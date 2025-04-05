import { NextResponse } from 'next/server';
import { syncRouteDetails } from '@/lib/sync-routes';

export async function POST() {
  try {
    await syncRouteDetails();
    return NextResponse.json({ message: 'Route details synced successfully' });
  } catch (error) {
    console.error('Error syncing route details:', error);
    return NextResponse.json(
      { error: 'Failed to sync route details' },
      { status: 500 }
    );
  }
} 