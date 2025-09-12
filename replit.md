# FlowCore - All-in-One Business Management Platform

## Overview

FlowCore is a comprehensive business management SaaS platform that combines CRM, sales tracking, project management, ticketing, and communication tools into a single, integrated solution. The application is built with a modern full-stack architecture using React for the frontend and Node.js/Express for the backend, with PostgreSQL as the database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful endpoints with proper error handling

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Users**: Authentication and user management
- **Leads**: Customer relationship management
- **Tickets**: Support ticket system
- **Deals**: Sales pipeline management
- **Projects**: Project tracking with tasks
- **Tasks**: Individual task management
- **Emails**: Communication history

## Key Components

### Core Business Modules
1. **CRM Module**: Lead management with status tracking, priority levels, and tagging
2. **Sales Module**: Deal pipeline, revenue tracking, and sales analytics
3. **Tickets Module**: Support ticket system with priority and assignment features
4. **Projects Module**: Project management with task tracking and progress visualization
5. **Email Module**: Communication tracking and history

### AI Assistant
- Integrated chatbot with natural language processing
- Supports navigation commands and entity creation
- Uses OpenAI API for intelligent responses
- Context-aware assistance for business operations

### User Interface
- **Layout**: Sidebar navigation with module switching
- **Components**: Reusable UI components from shadcn/ui
- **Responsiveness**: Mobile-first design with responsive breakpoints
- **Theme**: Light/dark mode support with CSS variables

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Routes**: Express routes handle CRUD operations
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Data Validation**: Zod schemas ensure type safety
5. **Response Handling**: Structured JSON responses with error handling

### State Management Flow
- Server state managed by TanStack Query with caching
- Local component state handled by React hooks
- Form state managed by React Hook Form with Zod validation
- Real-time updates through query invalidation

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database operations
- **Connection**: Pool-based connections for scalability

### AI Integration
- **OpenAI API**: Natural language processing for AI assistant
- **Context Processing**: Intent recognition and response generation

### UI Framework
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Primitive components for complex interactions
- **Tailwind CSS**: Utility-first styling

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the application
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React bundle
2. **Backend**: ESBuild compiles TypeScript to JavaScript
3. **Assets**: Static files served from dist/public directory

### Environment Configuration
- **Development**: Local development with hot reloading
- **Production**: Optimized builds with environment variables
- **Database**: Automatic migrations with Drizzle Kit

### Server Setup
- **Express Server**: Serves both API and static files
- **Middleware**: Request logging, error handling, and CORS
- **Session Management**: Cookie-based sessions with PostgreSQL storage

The application follows a monolithic architecture with clear separation between frontend and backend concerns, making it maintainable and scalable for business management needs.