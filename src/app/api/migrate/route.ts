import { NextResponse } from 'next/server';
import { migrateAll, migrateRoutesDb, migrateCareerDb } from '@/lib/migrate-all';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbType = searchParams.get('db');
    
    if (dbType === 'routes') {
      await migrateRoutesDb();
      return NextResponse.json({ message: 'Routes database migrations completed successfully' });
    } else if (dbType === 'career') {
      await migrateCareerDb();
      return NextResponse.json({ message: 'Career database migrations completed successfully' });
    } else {
      // Migrate both by default
      await migrateAll();
      return NextResponse.json({ message: 'All database migrations completed successfully' });
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    return NextResponse.json(
      { error: 'Failed to run database migrations' },
      { status: 500 }
    );
  }
} 