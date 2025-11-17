# Architecture Overview

## System Architecture

NextFleet follows a modern, scalable architecture pattern built on Next.js 15's App Router.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI   │  │  TanStack    │  │  NextAuth    │  │
│  │  Components  │  │    Query     │  │    Client    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Server                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Server     │  │  API Routes  │  │  Middleware  │  │
│  │  Components  │  │   (REST)     │  │   (Auth)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  NodeCache   │  │    Prisma    │  │     Neon     │  │
│  │   (Memory)   │  │     ORM      │  │  PostgreSQL  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer (`app/`, `components/`)

#### Responsibilities

- Rendering UI components
- Handling user interactions
- Managing local state
- Displaying data

#### Key Components

- **Server Components**: Data fetching, SEO-optimized pages
- **Client Components**: Interactive forms, charts, modals
- **Layout Components**: Consistent page structure
- **UI Components**: Reusable ShadCN/UI components

### 2. Business Logic Layer (`hooks/`, `lib/`)

#### Responsibilities

- Data fetching and caching
- Form validation
- Business rules
- Utility functions

#### Key Modules

- **Custom Hooks**: Encapsulate data fetching logic
- **Validation Schemas**: Zod schemas for type-safe validation
- **Utility Functions**: Date formatting, calculations
- **Type Definitions**: Shared TypeScript interfaces

### 3. Data Access Layer (`app/api/`, `lib/`)

#### Responsibilities

- API route handlers
- Database interactions
- Caching strategies
- Data transformation

#### Key Features

- RESTful API design
- In-memory caching with NodeCache
- Optimistic updates
- Error handling

### 4. Data Storage Layer (`prisma/`)

#### Responsibilities

- Data persistence
- Schema management
- Migrations

#### Technologies

- Prisma ORM
- Neon PostgreSQL (serverless)
- Type-safe queries
- Connection pooling

## Data Flow

### Read Operations (GET)

```
User Action → Component → TanStack Query Hook → API Route
                ↓                                    ↓
            Cache Check ←─────────── NodeCache Check
                ↓                                    ↓
          Render Data ←────────────── Database Query
```

### Write Operations (POST/PUT/DELETE)

```
User Action → Form Submit → Validation (Zod)
                ↓
          TanStack Query Mutation
                ↓
        Optimistic Update (UI)
                ↓
          API Route Handler
                ↓
          Database Operation
                ↓
        Cache Invalidation
                ↓
          Refetch Data
```

## Component Organization

### Server Components

```
app/
├── dashboard/
│   ├── page.tsx              # Server Component (data fetching)
│   ├── loading.tsx           # Loading state
│   └── error.tsx             # Error boundary
```

**Benefits:**

- Zero JavaScript sent to client
- Direct database access
- Better SEO
- Faster initial page load

### Client Components

```
components/
├── forms/
│   └── vehicle-form.tsx      # Client Component (interactive)
├── charts/
│   └── monthly-chart.tsx     # Client Component (visualization)
```

**Benefits:**

- Interactive features
- State management
- Event handlers
- Third-party integrations

## State Management Strategy

### Global State

- **Session State**: NextAuth.js (user, role)
- **Server State**: TanStack Query (vehicles, analytics)

### Local State

- **Form State**: React Hook Form
- **UI State**: React useState (modals, dropdowns)

### Cache Strategy

```typescript
// TanStack Query Configuration
{
  staleTime: 60_000,              // 60 seconds
  refetchOnWindowFocus: false,     // Manual refetch
  optimisticUpdates: true          // Immediate UI feedback
}

// NodeCache Configuration
{
  stdTTL: 60,                      // 60 seconds
  checkperiod: 120,                // Cleanup every 120s
  useClones: false                 // Performance optimization
}
```

## Authentication Flow

```
Login Request → NextAuth.js → Credentials Validation
                                        ↓
                                  Generate JWT
                                        ↓
                                Set Cookie (httpOnly)
                                        ↓
                            Middleware Validates Token
                                        ↓
                            Access Dashboard (Protected)
```

### Role-Based Access Control (RBAC)

```typescript
Middleware Check → Session Check → Role Extraction
                                          ↓
                                    Admin / Operator
                                          ↓
                              Component-level Permissions
```

## API Design Principles

### RESTful Endpoints

```
GET    /api/vehicles           # List all vehicles
POST   /api/vehicles           # Create vehicle
PUT    /api/vehicles           # Update vehicle
DELETE /api/vehicles?id=:id    # Delete vehicle
GET    /api/vehicles/:id       # Get vehicle details
GET    /api/analytics?type=:type # Get analytics data
```

### Response Format

```typescript
// Success Response
{
  data: T,
  success: true,
  cached?: boolean
}

// Error Response
{
  success: false,
  message: string,
  code?: string
}
```

## Security Considerations

### Authentication

- JWT-based authentication
- httpOnly cookies
- CSRF protection (NextAuth built-in)

### Authorization

- Middleware-level route protection
- Component-level permission checks
- API route authorization

### Data Validation

- Client-side validation (React Hook Form + Zod)
- Server-side validation (Zod)
- Type-safe API contracts

### Secure Coding Practices

- Input sanitization
- SQL injection prevention (Prisma)
- XSS protection (React default)
- Rate limiting (future enhancement)

## Performance Optimization

### Code Splitting

- Dynamic imports
- Route-based splitting (Next.js default)
- Component lazy loading

### Caching Strategy

- **Browser Cache**: Static assets
- **Memory Cache**: NodeCache (60s TTL)
- **React Query Cache**: Client-side data cache
- **Next.js Cache**: Static page generation

### Bundle Optimization

- Server Components (zero client JS)
- Tree shaking
- Minification
- Compression

## Scalability Considerations

### Horizontal Scaling

- Stateless API routes
- External cache (Redis) for multi-instance
- Load balancing ready

### Vertical Scaling

- Optimized database queries
- Efficient data structures
- Memory-efficient caching

### Database Scaling

- Prisma connection pooling
- Query optimization
- Index strategy

## Error Handling Strategy

### Error Boundaries

```typescript
app/
├── dashboard/
│   └── error.tsx              # Catches runtime errors
```

### API Error Handling

```typescript
try {
  // API operation
} catch (error) {
  return NextResponse.json(
    { success: false, message: error.message },
    { status: 500 }
  );
}
```

### User Feedback

- Toast notifications (success/error)
- Loading states
- Empty states
- Error messages

## Testing Strategy

### Unit Tests

- Utility functions
- Validation schemas
- Custom hooks (with React Testing Library)

### Integration Tests

- API routes
- Component interactions
- Form submissions

### E2E Tests (Future)

- Playwright/Cypress
- Critical user journeys
- Authentication flows

## Deployment Architecture

### Development

```
Local Machine → npm run dev → http://localhost:3000
```

### Production (Vercel)

```
GitHub Push → Vercel Build → Edge Network → CDN
                    ↓
              Environment Variables
                    ↓
              Static Generation
                    ↓
              Serverless Functions (API Routes)
```

## Monitoring & Observability

### Current Implementation

- Console logging
- Error boundaries
- TanStack Query DevTools

### Future Enhancements

- Sentry for error tracking
- Analytics (PostHog, Mixpanel)
- Performance monitoring (Vercel Analytics)
- APM tools

## Technology Decisions

### Why App Router over Pages Router?

- Better performance with Server Components
- Improved data fetching patterns
- Nested layouts
- Future-proof architecture

### Why TanStack Query?

- Declarative data fetching
- Automatic caching and refetching
- Optimistic updates
- DevTools for debugging

### Why Prisma?

- Type-safe database queries
- Auto-generated types
- Migration management
- Multi-database support

### Why ShadCN/UI?

- Accessible by default
- Customizable with Tailwind
- No runtime overhead
- Copy-paste flexibility

## Conclusion

This architecture provides:

- **Scalability**: Easy to scale horizontally and vertically
- **Maintainability**: Clear separation of concerns
- **Performance**: Optimized at every layer
- **Developer Experience**: Type safety and modern tooling
- **User Experience**: Fast, responsive, and reliable
