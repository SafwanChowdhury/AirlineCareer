import { NextResponse } from 'next/server';
import { migrateAll } from '@/lib/migrate-all';

export async function GET() {
  try {
    console.log("Setting up databases...");
    
    // Use the migration script to set up both databases
    await migrateAll();

    console.log("Database setup complete!");
    return NextResponse.json({ message: "Database setup completed successfully" });
  } catch (error) {
    console.error("Error during setup:", error);
    return NextResponse.json(
      { error: "Failed to set up database" },
      { status: 500 }
    );
  }
} 