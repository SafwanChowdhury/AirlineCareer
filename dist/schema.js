"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeDetails = exports.schedules = exports.pilots = exports.airports = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.airports = (0, sqlite_core_1.sqliteTable)("airports", {
    id: (0, sqlite_core_1.integer)("id").primaryKey(),
    iataCode: (0, sqlite_core_1.text)("iata_code").notNull(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    city: (0, sqlite_core_1.text)("city").notNull(),
    country: (0, sqlite_core_1.text)("country").notNull(),
    latitude: (0, sqlite_core_1.text)("latitude").notNull(),
    longitude: (0, sqlite_core_1.text)("longitude").notNull()
});
exports.pilots = (0, sqlite_core_1.sqliteTable)("pilots", {
    id: (0, sqlite_core_1.integer)("id").primaryKey(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    homeBase: (0, sqlite_core_1.text)("home_base").notNull(),
    currentLocation: (0, sqlite_core_1.text)("current_location").notNull(),
    preferredAirline: (0, sqlite_core_1.text)("preferred_airline"),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull(),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull()
});
exports.schedules = (0, sqlite_core_1.sqliteTable)("schedules", {
    id: (0, sqlite_core_1.integer)("id").primaryKey(),
    pilotId: (0, sqlite_core_1.text)("pilot_id").notNull(),
    name: (0, sqlite_core_1.text)("name").notNull(),
    startLocation: (0, sqlite_core_1.text)("start_location").notNull(),
    endLocation: (0, sqlite_core_1.text)("end_location").notNull(),
    durationDays: (0, sqlite_core_1.integer)("duration_days").notNull(),
    haulPreferences: (0, sqlite_core_1.text)("haul_preferences").notNull(),
    createdAt: (0, sqlite_core_1.text)("created_at").notNull(),
    updatedAt: (0, sqlite_core_1.text)("updated_at").notNull()
});
exports.routeDetails = (0, sqlite_core_1.sqliteTable)("route_details", {
    routeId: (0, sqlite_core_1.integer)("route_id").primaryKey(),
    departureIata: (0, sqlite_core_1.text)("departure_iata").notNull(),
    departureCity: (0, sqlite_core_1.text)("departure_city").notNull(),
    departureCountry: (0, sqlite_core_1.text)("departure_country").notNull(),
    arrivalIata: (0, sqlite_core_1.text)("arrival_iata").notNull(),
    arrivalCity: (0, sqlite_core_1.text)("arrival_city").notNull(),
    arrivalCountry: (0, sqlite_core_1.text)("arrival_country").notNull(),
    distanceKm: (0, sqlite_core_1.integer)("distance_km").notNull(),
    durationMin: (0, sqlite_core_1.integer)("duration_min").notNull(),
    airlineIata: (0, sqlite_core_1.text)("airline_iata").notNull(),
    airlineName: (0, sqlite_core_1.text)("airline_name").notNull()
});
