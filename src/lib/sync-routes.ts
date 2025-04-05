// src/lib/sync-routes.ts

import { rawRoutesDb, rawCareerDb } from './db';

// Function to copy all route details from routes.db to career.db for proper references
export async function syncRouteDetails() {
  console.log('Syncing route_details from routes.db to career.db...');
  
  try {
    // First, clear existing route_details in career.db (to avoid duplicates)
    rawCareerDb.exec('DELETE FROM route_details');
    
    // Get all routes from routes.db
    const routes = rawRoutesDb.prepare(`
      SELECT 
        route_id,
        departure_iata,
        departure_city,
        departure_country,
        arrival_iata,
        arrival_city,
        arrival_country,
        distance_km,
        duration_min,
        airline_iata,
        airline_name
      FROM route_details
    `).all();
    
    console.log(`Found ${routes.length} routes to sync`);
    
    if (routes.length === 0) {
      console.warn('No routes found in routes.db. Make sure it is properly initialized.');
      return;
    }
    
    // Prepare statement for inserting routes into career.db
    const insertStmt = rawCareerDb.prepare(`
      INSERT INTO route_details (
        route_id,
        departure_iata,
        departure_city,
        departure_country,
        arrival_iata,
        arrival_city,
        arrival_country,
        distance_km,
        duration_min,
        airline_iata,
        airline_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Start a transaction for better performance
    const transaction = rawCareerDb.transaction((routes) => {
      for (const route of routes) {
        insertStmt.run(
          route.route_id,
          route.departure_iata,
          route.departure_city,
          route.departure_country,
          route.arrival_iata,
          route.arrival_city,
          route.arrival_country,
          route.distance_km,
          route.duration_min,
          route.airline_iata,
          route.airline_name
        );
      }
    });
    
    // Execute the transaction
    transaction(routes);
    
    console.log(`Successfully synced ${routes.length} routes to career.db`);
  } catch (error) {
    console.error('Error syncing route details:', error);
    throw error;
  }
}

// If this file is executed directly, run the sync
if (require.main === module) {
  syncRouteDetails()
    .then(() => {
      console.log('Route sync completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Route sync failed:', error);
      process.exit(1);
    });
} 