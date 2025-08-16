# Overview

puantropls is a full-stack web application designed for personnel timesheet and project management, primarily for businesses in Turkey. It enables tracking employee work hours, managing projects, handling financial transactions, and maintaining personnel records. Key features include a dark-themed interface with Turkish language support, comprehensive CRUD operations, a multi-item quote system, an integrated company directory with messaging, and a robust authentication and administrative system with data isolation. The business vision is to provide a comprehensive, user-friendly solution for managing various aspects of business operations efficiently.

# User Preferences

Preferred communication style: Simple, everyday language.
Performance priority: User strongly prefers minimal changes over complex optimizations that may worsen performance.

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
- PDF Export Turkish Character Support - implemented normalization function to handle ç, ğ, ı, ö, ş, ü characters in PDF reports with proper Helvetica font usage.
- Compact Dropdown UI for messaging - converted long conversation lists to space-efficient dropdown menus in both Messages page and Enhanced Company Directory.
- Real-time Search System for Messages - implemented working search functionality with instant filtering of companies as you type, replacing dropdown with interactive list view.
- Optimized Conversation List Heights - dramatically reduced messaging interface heights: Messages page (80px) and Enhanced Company Directory (80px from 500px), achieving significant space savings while maintaining usability.
- Bulk SMS System with NetGSM Integration - implemented comprehensive toplu SMS functionality with template management (20+ templates including campaign and holiday templates), recipient selection with dropdown format, cost calculation, SMS history tracking, real NetGSM API integration, and dynamic send button for personnel and customer notifications.
- User Account Management System - implemented comprehensive "Hesabım" (My Account) page for all users with profile editing (name, email), password change functionality, profile picture management, notifications preferences, and system preferences tabs. Accessible via blue header button for all authenticated users, with backend API endpoints for profile updates and password changes.
- Admin Payment Settings System - fully functional payment information management where admin can set bank details (bank name, account holder, IBAN, amount) and normal users can view these settings in their account page for PRO subscription payments. Fixed endpoint routing to use /api/payment-info for users instead of admin endpoints.
- Authentication Performance Optimization (Aug 16, 2025) - Dramatically improved login/logout speed by removing unnecessary company creation operations during authentication. Login time reduced from 2665ms to 345ms (8x improvement). Simplified auth endpoints for better performance.
- PRO Subscription System Implementation (Aug 16, 2025) - Added comprehensive subscription tier system with DEMO (default) and PRO (paid) user levels. Features include: PRO upgrade endpoint (/api/auth/upgrade-to-pro), subscription badge in header, dedicated Abonelik tab in user account page, PyTR payment integration (₺99/year), one-click payment confirmation system, and payment notifications displayed prominently in admin dashboard with real-time stats and recent activity tracking.
- Real-time Notification System Enhancement (Aug 16, 2025) - Implemented comprehensive notification system in header with Bell icon, unread notification counter, dropdown menu with notification details, automatic mark-as-read functionality, and direct navigation to message threads. Notifications refresh every 3 seconds and display sender information, timestamps, and read status.

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