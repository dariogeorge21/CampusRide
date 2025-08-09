import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import 'dotenv/config';
import { 
  insertStudentSchema, 
  insertBusRouteSchema, 
  insertBookingSchema,
  collegeIdSchema,
  adminLoginSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      // Simple admin authentication (in production, use proper hashing)
      if (username === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: "Invalid input" });
    }
  });

  // Student authentication/registration
  app.post("/api/student/auth", async (req, res) => {
    try {
      const { collegeId } = z.object({ 
        collegeId: collegeIdSchema 
      }).parse(req.body);
      
      let student = await storage.getStudentByCollegeId(collegeId);
      
      if (!student) {
        // Create new student if doesn't exist
        student = await storage.createStudent({ collegeId });
      }
      
      res.json({ success: true, student });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: error.errors[0].message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Authentication failed" 
        });
      }
    }
  });

  // Get student booking history
  app.get("/api/student/:collegeId/bookings", async (req, res) => {
    try {
      const { collegeId } = req.params;
      collegeIdSchema.parse(collegeId);
      
      const bookings = await storage.getStudentBookingHistory(collegeId);
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid college ID format" 
      });
    }
  });

  // Get all active bus routes
  app.get("/api/bus-routes", async (req, res) => {
    try {
      const routes = await storage.getActiveBusRoutes();
      res.json({ success: true, routes });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch bus routes" 
      });
    }
  });

  // Get all bus routes (admin)
  app.get("/api/admin/bus-routes", async (req, res) => {
    try {
      const routes = await storage.getAllBusRoutes();
      res.json({ success: true, routes });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch bus routes" 
      });
    }
  });

  // Create new bus route (admin)
  app.post("/api/admin/bus-routes", async (req, res) => {
    try {
      const busRouteData = insertBusRouteSchema.parse(req.body);
      
      // Check if bus number already exists
      const existing = await storage.getBusRouteByNumber(busRouteData.busNumber);
      if (existing) {
        return res.status(409).json({ 
          success: false, 
          message: "Bus number already exists" 
        });
      }
      
      const route = await storage.createBusRoute(busRouteData);
      res.json({ success: true, route });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid bus route data" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to create bus route" 
        });
      }
    }
  });

  // Update bus route (admin)
  app.put("/api/admin/bus-routes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const route = await storage.updateBusRoute(id, updateData);
      if (!route) {
        return res.status(404).json({ 
          success: false, 
          message: "Bus route not found" 
        });
      }
      
      res.json({ success: true, route });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to update bus route" 
      });
    }
  });

  // Delete bus route (admin)
  app.delete("/api/admin/bus-routes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteBusRoute(id);
      if (!success) {
        return res.status(404).json({ 
          success: false, 
          message: "Bus route not found" 
        });
      }
      
      res.json({ success: true, message: "Bus route deleted" });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete bus route" 
      });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Check if system is online
      const systemStatus = await storage.getSystemSetting("system_status");
      if (systemStatus?.value === "offline") {
        return res.status(503).json({ 
          success: false, 
          message: "System is currently offline. Please try again later." 
        });
      }
      
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Validate student exists
      const student = await storage.getStudent(bookingData.studentId);
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: "Student not found" 
        });
      }
      
      // Validate bus route exists and has available seats
      const busRoute = await storage.getBusRoute(bookingData.busRouteId);
      if (!busRoute) {
        return res.status(404).json({ 
          success: false, 
          message: "Bus route not found" 
        });
      }
      
      if (busRoute.availableSeats <= 0) {
        return res.status(409).json({ 
          success: false, 
          message: "No seats available on this bus" 
        });
      }
      
      // Check for duplicate booking
      const existingBookings = await storage.getBookingsByStudentId(student.id);
      const duplicateBooking = existingBookings.find(booking => 
        booking.busRouteId === bookingData.busRouteId && 
        booking.travelDate === bookingData.travelDate &&
        booking.status !== "cancelled"
      );
      
      if (duplicateBooking) {
        return res.status(409).json({ 
          success: false, 
          message: "You already have a booking for this bus on this date" 
        });
      }
      
      const booking = await storage.createBooking(bookingData);
      res.json({ success: true, booking });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid booking data" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to create booking" 
        });
      }
    }
  });

  // Get all bookings (admin)
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      const bookingsWithDetails = [];
      
      for (const booking of bookings) {
        const details = await storage.getBookingWithDetails(booking.id);
        bookingsWithDetails.push(details);
      }
      
      res.json({ success: true, bookings: bookingsWithDetails });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch bookings" 
      });
    }
  });

  // Get system settings
  app.get("/api/system/status", async (req, res) => {
    try {
      const systemStatus = await storage.getSystemSetting("system_status");
      res.json({ 
        success: true, 
        status: systemStatus?.value || "online" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to get system status" 
      });
    }
  });

  // Update system settings (admin)
  app.post("/api/admin/system/status", async (req, res) => {
    try {
      const { status } = z.object({ 
        status: z.enum(["online", "offline"]) 
      }).parse(req.body);
      
      await storage.setSystemSetting({ key: "system_status", value: status });
      res.json({ success: true, status });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: "Invalid status value" 
      });
    }
  });

  // Get dashboard stats (admin)
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allRoutes = await storage.getAllBusRoutes();
      const allBookings = await storage.getAllBookings();
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = await storage.getBookingsByDate(today);
      
      const totalBuses = allRoutes.length;
      const totalSeats = allRoutes.reduce((sum, route) => sum + route.totalSeats, 0);
      const availableSeats = allRoutes.reduce((sum, route) => sum + route.availableSeats, 0);
      const activeRoutes = allRoutes.filter(route => route.isActive).length;
      
      res.json({
        success: true,
        stats: {
          totalBuses,
          todayBookings: todayBookings.length,
          availableSeats,
          activeRoutes
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch stats" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
