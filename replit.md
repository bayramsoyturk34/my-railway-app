# Overview

PuantajPro is a full-stack web application designed for personnel timesheet and project management, primarily for businesses in Turkey. It enables tracking employee work hours, managing projects, handling financial transactions, and maintaining personnel records. Key features include a dark-themed interface with Turkish language support, comprehensive CRUD operations, a multi-item quote system, an integrated company directory with messaging, and a robust authentication and administrative system with data isolation. The business vision is to provide a comprehensive, user-friendly solution for managing various aspects of business operations efficiently.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite.
- **Routing**: Client-side routing with Wouter.
- **UI Framework**: Custom components based on Radix UI primitives and shadcn/ui, styled with Tailwind CSS.
- **Design System**: Dark theme as default with CSS custom properties for theming.
- **State Management**: TanStack Query (React Query) for server state management and caching.
- **Form Handling**: React Hook Form with Zod for validation.
- **Styling**: Tailwind CSS with custom color scheme and gradient utilities.

## Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript with ES modules.
- **API Design**: RESTful API with consistent endpoint patterns.
- **Request Handling**: Express middleware for JSON parsing and URL encoding.
- **Error Handling**: Centralized error handling.

## Data Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Schema Definition**: Centralized schema definitions using Drizzle and Zod.
- **Data Validation**: Input validation using Zod schemas.
- **Storage Layer**: Abstract storage interface for flexibility.
- **Migrations**: Database migrations managed by Drizzle Kit.

## Core Data Models
- **Personnel**: Employee records.
- **Projects**: Project management with client and financial details.
- **Timesheets**: Work hour tracking.
- **Transactions**: Financial records (income/expenses).
- **Notes**: General note-taking.
- **Contractors**: External contractor management.
- **Quotes**: Multi-item customer quote system with detailed line items and calculations.
- **Company Directory**: Company listings for inter-company communication.
- **Messages**: Real-time messaging and conversation storage.
- **Users**: User authentication, roles, and session management.

## Authentication & Security
- Custom email/password authentication system.
- Role-based access control with an admin system.
- Complete user data isolation, ensuring users only access their own data.
- Persistent session management using database storage.
- Request validation via Zod schemas and type-safe API contracts.

## Key Features Implemented
- Multi-Item Quote System with Excel/PDF export and editable terms.
- Robust Authentication and Role-Based Admin System.
- Comprehensive Data Isolation ensuring user-specific data.
- Company Directory with Real-time Messaging.
- Persistent Session Management.
- Integrated Personnel and Contractor Payment Systems with automatic cash management.
- Enhanced Messaging Notification System with direct routing.
- Turkish character support throughout the application, including exports.

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe ORM.
- **connect-pg-simple**: PostgreSQL session store.

## UI & Styling
- **Radix UI**: Accessible UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.
- **Inter Font**: Typography via Google Fonts.

## Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.

## State Management & API
- **TanStack Query**: Server state management.
- **React Hook Form**: Form state management.
- **Zod**: Runtime type validation.

## Development Environment
- **Replit Integration**: Optimizations for the Replit platform.