import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface FlightDetails {
  scheduled_flight_id: number;
  schedule_id: number;
  route_id: number;
  pilot_id: number;
  departure_time: string;
  arrival_time: string;
  departure_iata: string;
  arrival_iata: string;
  airline_iata: string;
  duration_min: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flightId = parseInt(params.id);
    if (isNaN(flightId)) {
      return NextResponse.json(
        { error: 'Invalid flight ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Start a transaction
    const transaction = db.transaction(() => {
      // Get the flight details first
      const flight = db.prepare(`
        SELECT 
          sf.*,
          rd.departure_iata,
          rd.arrival_iata,
          rd.airline_iata,
          rd.duration_min,
          s.pilot_id
        FROM scheduled_flights sf
        JOIN route_details rd ON sf.route_id = rd.route_id
        JOIN schedules s ON sf.schedule_id = s.schedule_id
        WHERE sf.scheduled_flight_id = ?
      `).get(flightId) as FlightDetails | undefined;

      if (!flight) {
        throw new Error('Flight not found');
      }

      // Update the flight status
      db.prepare(`
        UPDATE scheduled_flights
        SET status = ?
        WHERE scheduled_flight_id = ?
      `).run(status, flightId);

      // If the flight is completed or cancelled, add it to flight history
      if (status === 'completed' || status === 'cancelled') {
        db.prepare(`
          INSERT INTO flight_history (
            pilot_id,
            route_id,
            departure_time,
            arrival_time,
            departure_location,
            arrival_location,
            airline_iata,
            flight_duration_min,
            status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          flight.pilot_id,
          flight.route_id,
          flight.departure_time,
          flight.arrival_time,
          flight.departure_iata,
          flight.arrival_iata,
          flight.airline_iata,
          flight.duration_min,
          status
        );

        // If completed, update pilot's current location
        if (status === 'completed') {
          db.prepare(`
            UPDATE pilots
            SET current_location = ?
            WHERE pilot_id = ?
          `).run(flight.arrival_iata, flight.pilot_id);
        }
      }

      return flight;
    });

    // Execute the transaction
    const updatedFlight = transaction();

    return NextResponse.json(updatedFlight);
  } catch (error) {
    console.error('Error updating flight status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 