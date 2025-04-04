import { rawDb } from "./db";

async function dropPilotProfiles() {
  try {
    console.log("Dropping pilot_profiles table...");
    
    // Drop the pilot_profiles table
    rawDb.exec(`DROP TABLE IF EXISTS pilot_profiles`);
    
    console.log("Successfully dropped pilot_profiles table!");
  } catch (error) {
    console.error("Error dropping pilot_profiles table:", error);
    process.exit(1);
  }
}

dropPilotProfiles(); 