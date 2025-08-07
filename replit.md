# Overview

PuantajPro is a Turkish personnel timesheet and project management application. It's a full-stack web application that helps businesses track employee work hours, manage projects, handle financial transactions, and maintain personnel records. The application features a dark-themed interface with Turkish language support and includes comprehensive CRUD operations for managing personnel, timesheets, projects, and financial data.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Client-side routing with Wouter library for lightweight navigation
- **UI Framework**: Custom component library built on Radix UI primitives with Tailwind CSS
- **Design System**: shadcn/ui components with dark theme as default, using CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Styling**: Tailwind CSS with custom color scheme including gradient utilities and dark mode support

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture with consistent endpoint patterns
- **Request Handling**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot module replacement via Vite integration for seamless development experience

## Data Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Definition**: Centralized schema definitions in shared directory using Drizzle and Zod
- **Data Validation**: Input validation using Zod schemas for both client and server
- **Storage Layer**: Abstract storage interface allowing for flexible database implementations
- **Migrations**: Database migrations managed through Drizzle Kit

## Core Data Models
- **Personnel**: Employee records with personal information, positions, and status tracking
- **Projects**: Project management with client information, financial details, and status tracking
- **Timesheets**: Work hour tracking linked to personnel with date, time ranges, and notes
- **Transactions**: Financial record keeping for income and expenses with categorization
- **Notes**: General note-taking functionality
- **Contractors**: External contractor management

## Authentication & Security
- Currently implements basic session-based architecture preparation
- Request validation through Zod schemas
- Type-safe API contracts between frontend and backend

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe ORM with schema-first approach
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Inter Font**: Typography via Google Fonts

## Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

## State Management & API
- **TanStack Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

## Development Environment
- **Replit Integration**: Development environment optimizations for Replit platform
- **Runtime Error Overlay**: Enhanced error reporting during development