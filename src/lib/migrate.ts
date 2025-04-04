import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./db";
import path from "path";

async function main() {
  try {
    // Run migrations
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: path.join(__dirname, "migrations") });
    console.log("Database migrations completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run migrations
main(); 