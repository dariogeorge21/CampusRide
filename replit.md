# Bus Booking System - St Joseph's College

## Overview

This is a comprehensive bus booking system designed for St Joseph's College of Engineering & Technology. The system provides two main interfaces: a student portal for booking bus seats and an admin panel for managing bus routes, bookings, and system settings. Students can authenticate using their college ID, select from available bus routes, and make bookings for specific travel dates. Administrators can manage bus routes, monitor bookings, and control system settings including maintenance mode.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Design System**: Material Design inspired with custom color scheme (primary blue, secondary orange)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Data Storage**: In-memory storage implementation with interface for easy database migration
- **Validation**: Zod schemas for request/response validation
- **Session Management**: Basic authentication without persistent sessions

### Database Schema Design
- **Students Table**: Stores student information with college ID as unique identifier
- **Bus Routes Table**: Manages bus route information including seats, timing, and active status
- **Bookings Table**: Tracks student bookings with date and status
- **System Settings Table**: Key-value store for application configuration
- **ORM**: Drizzle ORM configured for PostgreSQL (ready for database integration)

### Authentication & Authorization
- **Student Authentication**: College ID based authentication (flexible format, minimum 3 characters)
- **Admin Authentication**: Simple username/password authentication
- **Authorization Pattern**: Role-based access with separate student and admin endpoints
- **Session Strategy**: Stateless authentication suitable for development environment

### Key Features & Business Logic
- **Seat Management**: Real-time seat availability tracking with booking constraints
- **Date-based Booking**: Students can book seats for future travel dates
- **System Maintenance Mode**: Admin-controlled offline mode for system updates
- **Booking History**: Complete booking history tracking for students and administrators
- **Route Management**: Full CRUD operations for bus routes with seat capacity management

### Development Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between client and server
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development Tools**: Hot reload with Vite, TypeScript checking, and development-specific tooling
- **Code Organization**: Clear separation between client, server, and shared code with path aliases

## External Dependencies

### Database & ORM
- **Drizzle ORM**: PostgreSQL-compatible ORM with migration support
- **Neon Database**: Serverless PostgreSQL database service integration ready
- **Database Migrations**: Configured migration system in `./migrations` directory

### UI Framework & Components  
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component system with customizable design

### Development & Build Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Form Management & Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for both client and server
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Date & Time Handling
- **date-fns**: Utility library for date manipulation and formatting

### Development Environment
- **Replit Integration**: Specialized plugins for Replit development environment
- **Runtime Error Overlay**: Development error handling and debugging tools