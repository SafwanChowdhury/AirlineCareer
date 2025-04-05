/**
 * This script initializes both databases and syncs route data
 * Run with: node scripts/init-db.js
 */

const { migrateAll } = require("../dist/migrate-all");
const { syncRouteDetails } = require("../dist/sync-routes");

async function initializeDatabases() {
  console.log("======================================");
  console.log("  AIRLINE ROUTES DATABASE SETUP");
  console.log("======================================");

  try {
    // Step 1: Create database schemas
    console.log("\n📊 Step 1: Creating database schemas...");
    await migrateAll();
    console.log("✅ Database schemas created successfully!");

    // Step 2: Sync route data
    console.log("\n🔄 Step 2: Syncing route data...");
    await syncRouteDetails();
    console.log("✅ Route data synced successfully!");

    console.log("\n🎉 Database initialization complete!");
    console.log("\nYou can now start the application.");
  } catch (error) {
    console.error("\n❌ Error initializing databases:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabases();
