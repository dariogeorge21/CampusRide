import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeId: text("college_id").notNull().unique(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
});

export const busRoutes = pgTable("bus_routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  busNumber: text("bus_number").notNull().unique(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  totalSeats: integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  departureTime: text("departure_time").notNull(),
  returnTime: text("return_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull(),
  busRouteId: text("bus_route_id").notNull(),
  travelDate: text("travel_date").notNull(),
  bookingTime: timestamp("booking_time").notNull().default(sql`now()`),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled
});

export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// Insert schemas
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

export const insertBusRouteSchema = createInsertSchema(busRoutes).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingTime: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
});

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type BusRoute = typeof busRoutes.$inferSelect;
export type InsertBusRoute = z.infer<typeof insertBusRouteSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Custom validation schemas
export const collegeIdSchema = z.string().regex(/^SJCET\d{7}$/, {
  message: "College ID must be in format SJCET followed by 7 digits (e.g., SJCET2024001)"
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
