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
│  │   Server     │  │    Server    │  │  Middleware  │  │
│  │  Components  │  │   Actions    │  │   (Auth)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  ┌──────────────┐                   ┌──────────────┐   │
│  │    Prisma    │                   │     Neon     │   │
│  │     ORM      │                   │  PostgreSQL  │   │
│  └──────────────┘                   └──────────────┘   │
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

### 3. Data Access Layer (`actions/`, `lib/`)

#### Responsibilities

- Server Actions for data mutations
- Database interactions via Prisma
- Authentication checks
- Data transformation

#### Key Features

- Server-only code execution
- Type-safe end-to-end
- Automatic cache revalidation
- Built-in error handling

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
User Action → Component → TanStack Query Hook → Server Action
                ↓                                      ↓
            Cache Check                      Auth Check (Session)
                ↓                                      ↓
          Render Data ←────────────── Database Query (Prisma)
```

### Write Operations (POST/PUT/DELETE)

```
User Action → Form Submit → Validation (Zod)
                ↓
          TanStack Query Mutation
                ↓
        Optimistic Update (UI)
                ↓
          Server Action Handler
                ↓
        Auth Check (Admin Only)
                ↓
          Database Operation
                ↓
        Cache Revalidation (revalidatePath)
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

// Next.js Cache Revalidation
{
  revalidatePath: '/dashboard',    // Automatic cache invalidation
  revalidatePath: '/dashboard/vehicles', // After mutations
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

## Server Actions Design

### Server Action Endpoints

```
// Vehicle Operations (actions/vehicles.ts)
getVehicles()              # List all vehicles
getVehicleById(id)         # Get vehicle details
createVehicle(data)        # Create vehicle (admin)
updateVehicle(id, updates) # Update vehicle (admin)
deleteVehicle(id)          # Delete vehicle (admin)

// Analytics Operations (actions/analytics.ts)
getDashboardData()         # Dashboard stats & charts
getAnalyticsData()         # Detailed analytics
```

### Response Format

```typescript
// Success Response
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Example
{
  success: true,
  data: {
    id: "123",
    name: "Vehicle 1",
    // ... vehicle data
  }
}

// Error Response
{
  success: false,
  error: "Unauthorized access"
}
```

## Security Considerations

### Authentication

- JWT-based authentication
- httpOnly cookies
- CSRF protection (NextAuth built-in)

### Authorization

- Middleware-level route protection
- Server Action authentication checks
- Component-level permission checks
- Role-based access control (ADMIN/OPERATOR)

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
- **React Query Cache**: Client-side data cache (60s)
- **Next.js Cache**: Static page generation + revalidation
- **Prisma Connection Pool**: Database connection reuse

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
// Server Action Error Handling
export async function createVehicle(
  data: VehicleInput
): Promise<ActionResponse<Vehicle>> {
  try {
    const authResult = await checkAdminAuth();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const vehicle = await prisma.vehicle.create({ data });
    revalidatePath("/dashboard/vehicles");
    return { success: true, data: vehicle };
  } catch (error) {
    return { success: false, error: "Failed to create vehicle" };
  }
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

- Server Actions
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
              Server Actions (Serverless)
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
