# Overview

PuantajPro is a Turkish personnel timesheet and project management application. It's a full-stack web application that helps businesses track employee work hours, manage projects, handle financial transactions, and maintain personnel records. The application features a dark-themed interface with Turkish language support and includes comprehensive CRUD operations for managing personnel, timesheets, projects, and financial data.

## Recent Changes (August 2025)
- ✅ Fixed customer search functionality in customer management page
- ✅ Implemented drag-and-drop navigation cards on dashboard
- ✅ Resolved SelectItem empty value prop errors in advanced filters
- ✅ Dashboard navigation cards: Puantaj Yaz, Personeller, Verilen Projeler, Kasa, Müşteriler, Raporlar
- ✅ Real-time data updates working properly with React Query cache invalidation
- ✅ Simplified dashboard card titles and removed customer data from cash management
- ✅ Updated timesheet form with customer selection and work type (TAM/YARIM/MESAİ)
- ✅ Removed overtime 50% bonus - mesai now uses normal hourly rate
- ✅ Converted personnel management to individual card layout (tekil kartlar)
- ✅ Added personnel detail pages with dedicated routes (/personnel/:id)
- ✅ Implemented personnel detail page with tabs: Puantaj, Hakediş, Ödeme
- ✅ Fixed date formatting issues in personnel detail views
- ✅ Migrated from memory storage to PostgreSQL database for data persistence
- ✅ Removed "Personel Aktivitesi" and "Günlük Aktivite" charts from analytics dashboard
- ✅ **Multi-Item Quote System**: Transformed customer quotes to support multiple tasks per quote
  - Added customerQuoteItems table for individual quote line items
  - Enhanced quote form UI with item addition/removal functionality
  - Implemented automatic total calculation for multi-task quotes
  - Updated backend storage layer for multi-item quote operations
  - Added unit selection (adet, m², m) for each quote item
  - Implemented edit/delete functionality for quote items
  - Added professional quote form design with detailed sections
  - Implemented Excel (CSV) and PDF export functionality
  - Enhanced form with visual feedback and better UX
- ✅ **Turkish Character Support**: Fixed Turkish character encoding issues throughout the application
  - Added character conversion for PDF exports (ş→s, ğ→g, ı→i, ç→c, ü→u, ö→o)
  - Ensured proper display of Turkish characters in all export formats
  - Fixed filename encoding for downloaded files
- ✅ **Editable Quote Terms**: Made quote terms section fully customizable
  - Added dynamic quote terms with add/remove functionality
  - Integrated editable terms with PDF exports
  - Users can now customize standard quote conditions per their business needs
- ✅ **Quote Creation System**: Fully resolved and enhanced quote creation functionality
  - Fixed critical API response serialization bug in apiRequest function
  - Server successfully creates quotes and returns proper JSON responses to frontend
  - Quote items now create successfully with correct quoteId linking
  - Enhanced debugging capabilities with comprehensive server logging
  - System now supports decimal quantities (e.g., 1.3, 2.5) for quote items
  - Updated database schema to use decimal precision for quantities
  - Improved quantity display formatting in UI, PDF exports, and CSV exports
- ✅ **Quote Approval Task Creation System**: Comprehensive fix for duplicate task creation and VAT handling
  - Eliminated duplicate task creation when quotes are approved (August 10, 2025)
  - Implemented duplicate prevention mechanism checking existing tasks by customer and title
  - Fixed VAT-inclusive amount calculation for approved quote tasks
  - Tasks now correctly use totalWithVAT for VAT-enabled quotes, totalAmount for VAT-disabled quotes
  - Individual quote item approval no longer creates automatic tasks - only full quote approval creates tasks
  - Enhanced logging system for debugging task creation process
  - Database cleanup performed to remove duplicate entries and correct VAT amounts
- ✅ **Task Form VAT Display Fix**: Corrected VAT-exclusive vs VAT-inclusive amount display (August 10, 2025)
  - Fixed "Ana Tutar" to show VAT-exclusive amounts, "Toplam Tutar" to show VAT-inclusive amounts
  - Updated task creation form to properly calculate and store VAT amounts
  - Enhanced task editing form to correctly populate quantity, unitPrice, and unit fields from approved quotes
  - Improved VAT calculation logic for both new task creation and existing task editing
- ✅ **Company Directory System**: Complete company directory with messaging infrastructure (August 10, 2025)
  - Implemented database schema for companyDirectory, messages, and conversations tables
  - Created comprehensive backend API endpoints for CRUD operations
  - Built responsive frontend with company listing, search, and form functionality
  - Added company directory navigation card to dashboard
  - Fixed ES modules import issues in backend routes
  - Optimized form dialog size for better user experience
  - **Active Messaging System**: Real-time messaging functionality fully operational
    * Professional chat interface with bubble design and timestamps
    * Auto-scroll to new messages and Enter key message sending
    * Real-time message polling every 3 seconds for live updates
    * Bidirectional messaging between current user and companies
    * Message persistence in PostgreSQL database
- ✅ **Authentication System**: Secure login system implemented with Replit Auth (August 10, 2025)
  - Integrated Replit OpenID Connect authentication for secure user access
  - Added session management with PostgreSQL session storage
  - Created landing page for non-authenticated users showcasing PuantajPro features
  - Implemented user authentication hooks and utilities for frontend
  - Added logout functionality with user display in header
  - Protected all routes requiring authentication
  - Database schema updated with users and sessions tables
  - Enhanced security for messaging system - only authenticated app users can access

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