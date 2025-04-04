import { NextResponse } from 'next/server';
import { initializeCareerTables } from '@/lib/career-db';

export async function POST() {
  try {
    await initializeCareerTables();
    return NextResponse.json({ message: 'Career tables initialized successfully' });
  } catch (error) {
    console.error('Error initializing career tables:', error);
    return NextResponse.json(
      { error: 'Failed to initialize career tables' },
      { status: 500 }
    );
  }
} 