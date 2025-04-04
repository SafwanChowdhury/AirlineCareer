import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const airports = sqliteTable("airports", {
  id: integer("id").primaryKey(),
  iataCode: text("iata_code").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull()
});

export const pilots = sqliteTable("pilots", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  homeBase: text("home_base").notNull(),
  currentLocation: text("current_location").notNull(),
  preferredAirline: text("preferred_airline"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey(),
  pilotId: text("pilot_id").notNull(),
  name: text("name").notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  durationDays: integer("duration_days").notNull(),
  haulPreferences: text("haul_preferences").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
}); 