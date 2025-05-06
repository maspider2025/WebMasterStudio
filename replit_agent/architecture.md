# Architecture Overview

## Overview

This application is a full-stack e-commerce website builder with an integrated online store solution. It follows a client-server architecture with a React frontend, Node.js/Express backend, and PostgreSQL database. The system allows users to create and manage websites with a particular focus on e-commerce functionality.

## System Architecture

The application follows a modern web application architecture with the following key components:

### Frontend Architecture

- **Framework**: React with TypeScript
- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**:
  - TanStack Query (React Query) for server state management
  - Zustand for client-state management (especially for the editor functionality)
- **UI Components**: Custom components built with Radix UI primitives and styled with Tailwind CSS
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture

- **Framework**: Express.js (Node.js) with TypeScript
- **API**: RESTful API endpoints under the `/api` prefix
- **Database Access**: Drizzle ORM for type-safe database operations

### Database Architecture

- **Database**: PostgreSQL (via Neon Serverless Postgres)
- **ORM**: Drizzle ORM for database schema definition and queries
- **Schema**: Structured for e-commerce with entities for users, projects, pages, elements, products, categories, cart functionality, etc.

### Authentication

- Uses bcrypt for password hashing
- Session-based authentication system

## Key Components

### Client-Side Components

1. **Page Editor**
   - Provides drag-and-drop functionality for website building
   - Uses the Canvas component for the editing surface
   - Includes a property panel for configuring element properties
   - Features a code editor for direct HTML/CSS/JS editing

2. **E-commerce Components**
   - Product listing and detail pages
   - Shopping cart functionality
   - Checkout process
   - Order confirmation

3. **UI Component Library**
   - Comprehensive set of UI components built with Radix UI and styled with Tailwind CSS
   - Includes form elements, dialogs, dropdowns, etc.

### Server-Side Components

1. **API Routes**
   - User authentication and management
   - Project and page management
   - E-commerce product and order management
   - Shopping cart functionality

2. **Payment Processing**
   - Stripe integration for card payments
   - PayPal integration for alternative payment options

3. **Storage Utilities**
   - Database operations abstracted through a storage utility layer

## Data Models

The application has a well-defined database schema that includes:

1. **Users Model**
   - Core user account information
   - Authentication credentials

2. **Projects Model**
   - Represents websites created by users
   - Contains metadata about the website

3. **Pages Model**
   - Individual pages within a project
   - Linked to the project they belong to

4. **Elements Model**
   - UI elements placed on pages
   - Contains positioning, styling, and content data

5. **E-commerce Models**
   - Products
   - Product Categories
   - Product Variants
   - Shopping Cart
   - Orders

## Data Flow

### Request Handling Flow

1. Client makes a request to the server
2. Express middleware processes the request
3. If it's an API request, it's routed to the appropriate endpoint handler
4. If it's a page request, it's handled by the Vite middleware in development or serves static files in production
5. Database operations are performed via the Drizzle ORM
6. Response is sent back to the client

### Payment Processing Flow

1. Client initiates checkout
2. Server creates a payment intent with the payment provider (Stripe or PayPal)
3. Client completes payment on the provider's interface
4. Payment provider sends confirmation to the server
5. Server updates order status and sends confirmation to the client

## External Dependencies

### Frontend Dependencies

- Radix UI: For accessible UI components
- TanStack Query: For data fetching and caching
- Zustand: For state management
- Tailwind CSS: For styling
- Shadcn UI: Component styles and theming

### Backend Dependencies

- Express: Web server framework
- Drizzle: Database ORM
- Bcrypt: Password hashing
- Neon Serverless Postgres: Database service

### Third-Party Services

- Stripe: Payment processing
- PayPal: Alternative payment processing
- Neon Database: PostgreSQL database hosting

## Deployment Strategy

The application is set up for deployment on Replit, as indicated by the `.replit` configuration file. The deployment process includes:

1. **Build Process**:
   - Frontend: Vite builds the React application to static assets
   - Backend: esbuild bundles the server code for production

2. **Runtime Configuration**:
   - The application runs in Node.js environment
   - Environment variables are used for configuration
   - Database connection is established via DATABASE_URL environment variable

3. **Workflow**:
   - Development: `npm run dev` runs both client and server in development mode
   - Production: `npm run start` runs the built application

## Development Patterns

1. **Code Organization**:
   - `/client`: Frontend code
   - `/server`: Backend code
   - `/db`: Database configuration and utilities
   - `/shared`: Shared types and utilities

2. **Type Safety**:
   - TypeScript throughout the codebase
   - Schema validation using Zod
   - Type-safe database operations with Drizzle

3. **API Design**:
   - RESTful endpoints
   - JSON request/response format
   - Error handling middleware

4. **State Management**:
   - Server state managed with TanStack Query
   - UI state managed with React's useState and useContext
   - Complex state (like editor state) managed with Zustand