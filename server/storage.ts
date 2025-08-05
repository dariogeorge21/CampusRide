import { 
  type Student, 
  type InsertStudent,
  type BusRoute,
  type InsertBusRoute,
  type Booking,
  type InsertBooking,
  type SystemSettings,
  type InsertSystemSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByCollegeId(collegeId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Bus route operations
  getAllBusRoutes(): Promise<BusRoute[]>;
  getActiveBusRoutes(): Promise<BusRoute[]>;
  getBusRoute(id: string): Promise<BusRoute | undefined>;
  getBusRouteByNumber(busNumber: string): Promise<BusRoute | undefined>;
  createBusRoute(busRoute: InsertBusRoute): Promise<BusRoute>;
  updateBusRoute(id: string, busRoute: Partial<BusRoute>): Promise<BusRoute | undefined>;
  deleteBusRoute(id: string): Promise<boolean>;
  
  // Booking operations
  getAllBookings(): Promise<Booking[]>;
  getBookingsByStudentId(studentId: string): Promise<Booking[]>;
  getBookingsByBusRouteId(busRouteId: string): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined>;
  
  // System settings operations
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  setSystemSetting(setting: InsertSystemSettings): Promise<SystemSettings>;
  
  // Utility operations
  getBookingWithDetails(bookingId: string): Promise<any>;
  getStudentBookingHistory(collegeId: string): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private students: Map<string, Student>;
  private busRoutes: Map<string, BusRoute>;
  private bookings: Map<string, Booking>;
  private systemSettings: Map<string, SystemSettings>;

  constructor() {
    this.students = new Map();
    this.busRoutes = new Map();
    this.bookings = new Map();
    this.systemSettings = new Map();
    
    // Initialize with default system settings
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    // Set system online by default
    await this.setSystemSetting({ key: "system_status", value: "online" });
    
    // Create some sample bus routes with available dates
    const today = new Date();
    const availableDates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      availableDates.push(date.toISOString().split('T')[0]);
    }

    const sampleRoutes = [
      {
        busNumber: "BUS-001",
        origin: "Tambaram",
        destination: "SJCET Campus",
        totalSeats: 40,
        availableSeats: 23,
        departureTime: "07:30",
        returnTime: "17:00",
        availableDates: availableDates,
        isActive: true
      },
      {
        busNumber: "BUS-002",
        origin: "Chrompet",
        destination: "SJCET Campus",
        totalSeats: 35,
        availableSeats: 8,
        departureTime: "08:00",
        returnTime: "17:30",
        availableDates: availableDates.slice(0, 20), // Limited dates for this route
        isActive: true
      },
      {
        busNumber: "BUS-003",
        origin: "Velachery",
        destination: "SJCET Campus",
        totalSeats: 40,
        availableSeats: 0,
        departureTime: "07:45",
        returnTime: "17:15",
        availableDates: availableDates.slice(0, 15), // Even more limited dates
        isActive: true
      }
    ];

    for (const route of sampleRoutes) {
      await this.createBusRoute(route);
    }
  }

  // Student operations
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByCollegeId(collegeId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(
      student => student.collegeId === collegeId
    );
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { 
      ...insertStudent, 
      id,
      name: insertStudent.name || null,
      email: insertStudent.email || null,
      phone: insertStudent.phone || null
    };
    this.students.set(id, student);
    return student;
  }

  // Bus route operations
  async getAllBusRoutes(): Promise<BusRoute[]> {
    return Array.from(this.busRoutes.values());
  }

  async getActiveBusRoutes(): Promise<BusRoute[]> {
    return Array.from(this.busRoutes.values()).filter(route => route.isActive);
  }

  async getBusRoute(id: string): Promise<BusRoute | undefined> {
    return this.busRoutes.get(id);
  }

  async getBusRouteByNumber(busNumber: string): Promise<BusRoute | undefined> {
    return Array.from(this.busRoutes.values()).find(
      route => route.busNumber === busNumber
    );
  }

  async createBusRoute(insertBusRoute: InsertBusRoute): Promise<BusRoute> {
    const id = randomUUID();
    const busRoute: BusRoute = { 
      ...insertBusRoute, 
      id,
      isActive: insertBusRoute.isActive ?? true,
      availableDates: insertBusRoute.availableDates || []
    };
    this.busRoutes.set(id, busRoute);
    return busRoute;
  }

  async updateBusRoute(id: string, busRoute: Partial<BusRoute>): Promise<BusRoute | undefined> {
    const existing = this.busRoutes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...busRoute };
    this.busRoutes.set(id, updated);
    return updated;
  }

  async deleteBusRoute(id: string): Promise<boolean> {
    return this.busRoutes.delete(id);
  }

  // Booking operations
  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookingsByStudentId(studentId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.studentId === studentId
    );
  }

  async getBookingsByBusRouteId(busRouteId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.busRouteId === busRouteId
    );
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.travelDate === date
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      bookingTime: new Date(),
      status: insertBooking.status || "confirmed"
    };
    this.bookings.set(id, booking);
    
    // Update available seats
    const busRoute = await this.getBusRoute(booking.busRouteId);
    if (busRoute && busRoute.availableSeats > 0) {
      await this.updateBusRoute(busRoute.id, { 
        availableSeats: busRoute.availableSeats - 1 
      });
    }
    
    return booking;
  }

  async updateBooking(id: string, booking: Partial<Booking>): Promise<Booking | undefined> {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...booking };
    this.bookings.set(id, updated);
    return updated;
  }

  // System settings operations
  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    return this.systemSettings.get(key);
  }

  async setSystemSetting(insertSetting: InsertSystemSettings): Promise<SystemSettings> {
    const id = randomUUID();
    const setting: SystemSettings = { ...insertSetting, id };
    this.systemSettings.set(setting.key, setting);
    return setting;
  }

  // Utility operations
  async getBookingWithDetails(bookingId: string): Promise<any> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return null;
    
    const student = await this.getStudent(booking.studentId);
    const busRoute = await this.getBusRoute(booking.busRouteId);
    
    return {
      ...booking,
      student,
      busRoute
    };
  }

  async getStudentBookingHistory(collegeId: string): Promise<any[]> {
    const student = await this.getStudentByCollegeId(collegeId);
    if (!student) return [];
    
    const bookings = await this.getBookingsByStudentId(student.id);
    const bookingsWithDetails = [];
    
    for (const booking of bookings) {
      const busRoute = await this.getBusRoute(booking.busRouteId);
      bookingsWithDetails.push({
        ...booking,
        busRoute
      });
    }
    
    return bookingsWithDetails.sort((a, b) => 
      new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()
    );
  }
}

export const storage = new MemStorage();
