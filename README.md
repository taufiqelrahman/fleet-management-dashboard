# NextFleet - Fleet Management Dashboard

<div align="center">
  <h3>Enterprise-grade Fleet Management System built with Next.js 15</h3>
  <p>A modern, type-safe dashboard for managing vehicle fleets with real-time analytics and role-based access control</p>
</div>

## 🚀 Overview

NextFleet is a comprehensive fleet management dashboard designed to showcase enterprise-grade frontend development practices. Built with Next.js 15 (App Router), it demonstrates clean architecture, TypeScript best practices, and professional UI/UX design suitable for remote work in MENA/GCC regions.

## ✨ Features

### Authentication & Authorization

- 🔐 Secure authentication using NextAuth.js
- 👥 Role-based access control (Admin & Operator)
- 🔒 Protected routes with middleware
- 📧 Credentials-based login

### Dashboard

- 📊 Real-time fleet statistics
  - Total vehicles count
  - Active vehicles monitoring
  - Average fuel consumption
  - Upcoming maintenance schedule
- 📈 Interactive charts with Recharts
  - Monthly mileage trends
  - Vehicle status overview
- ⚡ Suspense boundaries for smooth loading states

### Vehicle Management

- 🚗 Comprehensive CRUD operations
- ✅ Form validation with Zod & React Hook Form
- 🎨 Professional UI with ShadCN/UI components
- 🔄 Optimistic updates with TanStack Query
- 🔐 Role-based permissions (Admin only for edit/delete)
- 📋 Sortable and filterable vehicle list
- 🔍 Dynamic vehicle detail pages with trip history

### Analytics

- 📊 Fuel consumption trends
- 📈 Vehicle utilization rates
- 👤 Driver performance metrics
- 💾 In-memory caching (60s TTL) with NodeCache

### Database

- 🐘 PostgreSQL via [Neon](https://neon.tech) - Serverless, auto-scaling
- 🔄 Prisma ORM for type-safe database access
- 🌿 Database branching support
- 📦 Connection pooling built-in

### Error Handling

- ⚠️ Comprehensive error boundaries
- 🎯 Empty state handling
- 🔄 Fallback UI components
- 📝 User-friendly error messages

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Form Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Database**: [Neon PostgreSQL](https://neon.tech/) + [Prisma ORM](https://www.prisma.io/)
- **Caching**: [NodeCache](https://www.npmjs.com/package/node-cache)

## 📁 Project Structure

```
fleet-management-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── vehicles/             # Vehicle CRUD endpoints
│   │   └── analytics/            # Analytics data endpoint
│   ├── dashboard/                # Dashboard pages
│   │   ├── vehicles/             # Vehicle management
│   │   │   └── [id]/             # Vehicle detail page
│   │   ├── analytics/            # Analytics page
│   │   ├── page.tsx              # Main dashboard
│   │   ├── loading.tsx           # Loading state
│   │   └── error.tsx             # Error boundary
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Provider setup
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # ShadCN UI components
│   ├── charts/                   # Recharts components
│   ├── forms/                    # Form components
│   └── layout/                   # Layout components
│       ├── sidebar.tsx           # Navigation sidebar
│       ├── navbar.tsx            # Mobile navbar
│       └── dashboard-layout.tsx  # Dashboard wrapper
├── hooks/
│   ├── useVehicles.ts            # Vehicle data hooks
│   ├── useAnalytics.ts           # Analytics data hooks
│   └── useRole.ts                # Role-based access hook
├── lib/
│   ├── api-client.ts             # API client wrapper
│   ├── cache.ts                  # NodeCache configuration
│   ├── auth.ts                   # NextAuth configuration
│   ├── validation.ts             # Zod schemas
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   └── prisma.ts                 # Prisma client instance
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── docs/                         # Documentation
│   ├── architecture.md           # Architecture overview
│   ├── design-decisions.md       # Design decisions
│   ├── performance.md            # Performance optimizations
│   └── neon-setup.md             # Neon PostgreSQL setup guide
├── __tests__/                    # Unit tests
│   ├── utils.test.ts             # Utility tests
│   └── validation.test.ts        # Validation tests
├── middleware.ts                 # Route protection
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (optional, for containerization)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd fleet-management-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
```

4. **Set up Neon PostgreSQL Database:**

   a. Go to [https://neon.tech](https://neon.tech) and create a free account

   b. Create a new project and copy the connection string

   c. Edit `.env.local` with your Neon connection string:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

> 📖 See detailed setup guide: [docs/neon-setup.md](./docs/neon-setup.md)

5. Initialize the database:

```bash
npm run prisma:generate
npm run prisma:push
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### 🐳 Docker Deployment

**Build and run with Docker:**

```bash
docker build -t nextfleet .
docker run -p 3000:3000 -e NEXTAUTH_SECRET="your-secret" nextfleet
```

**Or use Docker Compose:**

```bash
docker-compose up
```

### 🧪 Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run Jest tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with Indonesian demo data

### Demo Credentials

**Admin Account:**

- Email: `admin@nextfleet.com`
- Password: `password123`
- Permissions: Full CRUD access

**Operator Account:**

- Email: `operator@nextfleet.com`
- Password: `password123`
- Permissions: Read-only access

## 🏗 Architecture

### Server Components vs Client Components

- **Server Components**: Used for pages and data fetching
- **Client Components**: Used for interactive UI and forms
- Clear separation ensures optimal performance

### Data Fetching Strategy

- TanStack Query for client-side data management
- Server-side caching with NodeCache (60s TTL)
- Optimistic updates for better UX
- Automatic cache invalidation on mutations

### Type Safety

- Strict TypeScript configuration
- Zod schemas for runtime validation
- Type-safe API routes and responses
- End-to-end type safety from API to UI

For detailed architecture documentation, see:

- [architecture.md](docs/architecture.md) - System architecture
- [neon-setup.md](docs/neon-setup.md) - Neon PostgreSQL setup guide
- [MIGRATION-NEON.md](MIGRATION-NEON.md) - Migration guide from SQLite to Neon

## 📊 Key Features Demonstration

### 1. Authentication Flow

```typescript
// Protected routes with middleware
export { default } from "next-auth/middleware";
export const config = { matcher: ["/dashboard/:path*"] };
```

### 2. Role-Based Access Control

```typescript
// useRole hook
const { canEdit, canDelete, canCreate } = useRole();
```

### 3. Optimistic Updates

```typescript
// Vehicle update with rollback on error
const updateVehicle = useUpdateVehicle();
// Optimistic update in onMutate
// Rollback in onError
```

### 4. In-Memory Caching

```typescript
// NodeCache with 60s TTL
const cached = getCachedData<Vehicle[]>("vehicles");
if (cached) return cached;
// Fetch and cache
setCachedData("vehicles", data, 60);
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check
```

## 🔨 Build & Deployment

### Production Build

```bash
npm run build
npm start
```

### Vercel Deployment

The project is optimized for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📈 Performance Optimizations

- Server Components for reduced JavaScript bundle
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Route prefetching
- In-memory caching (NodeCache)
- TanStack Query staleTime configuration
- Suspense boundaries for progressive loading

See [performance.md](docs/performance.md) for detailed analysis.

## 🎨 Design Decisions

### Why Next.js 15?

- Latest features (Server Actions, Partial Prerendering)
- Excellent TypeScript support
- Built-in optimizations
- Easy deployment

### Why TanStack Query?

- Powerful caching mechanisms
- Optimistic updates
- Automatic refetching
- DevTools integration

### Why ShadCN/UI?

- Accessible components
- Customizable with Tailwind
- Copy-paste friendly
- TypeScript-first

For more design decisions, see [design-decisions.md](docs/design-decisions.md).

## 🔮 Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Export to PDF/Excel
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] Advanced analytics with AI insights
- [ ] Mobile app (React Native)
- [ ] Integration with GPS tracking
- [ ] Maintenance scheduling system

## 🤝 Contributing

We ❤️ contributions!

- Check out good first issues here
- Fork the repo & create a branch:

```bash
git checkout -b feature/amazing-feature
```

- Commit & push your changes:

```bash
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

- Open a Pull Request to main.

### Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Keep code clean & formatted

## 📄 License

MIT License

## 🐛 Bug Reports & Feature Requests

Submit via [GitHub Issues](https://github.com/taufiqelrahman/fleet-management-dashboard/issues).

## 👨‍💻 Author

Built with ❤️ for demonstrating enterprise-level frontend development skills.

---

**Note**: This project demonstrates modern web development practices using a real PostgreSQL backend (Neon). Authentication uses mock credentials for demo purposes only. In a production environment, always integrate with a secure authentication provider and store credentials safely.
