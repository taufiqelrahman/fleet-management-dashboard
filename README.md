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
- ⚡ Real-time data fetching with Server Actions

### Internationalization (i18n)

- 🌍 Multi-language support (English & Indonesian)
- 🔄 Seamless language switching with locale-aware routing
- 🎌 Visual language selector with flag indicators
- 📝 Comprehensive translations for all UI elements
- 🔗 Locale-prefixed URLs for SEO optimization

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
- **Data Fetching**: Next.js Server Actions
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (English & Indonesian)

## 📁 Project Structure

```
fleet-management-dashboard/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-based routing (en, id)
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── vehicles/         # Vehicle management
│   │   │   │   └── [id]/         # Vehicle detail page
│   │   │   ├── analytics/        # Analytics page
│   │   │   ├── page.tsx          # Main dashboard
│   │   │   ├── loading.tsx       # Loading state
│   │   │   └── error.tsx         # Error boundary
│   │   ├── login/                # Login page
│   │   └── layout.tsx            # Locale layout with i18n provider
│   ├── api/                      # API Routes
│   │   └── auth/[...nextauth]/   # NextAuth configuration
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   ├── providers.tsx             # Provider setup
│   └── globals.css               # Global styles
├── actions/                      # Server Actions
│   ├── vehicles.ts               # Vehicle CRUD operations
│   └── analytics.ts              # Analytics data operations
├── components/
│   ├── ui/                       # ShadCN UI components
│   ├── charts/                   # Recharts components
│   ├── forms/                    # Form components
│   ├── locale-switcher.tsx       # Language switcher component
│   └── layout/                   # Layout components
│       ├── sidebar.tsx           # Navigation sidebar (with locale switcher)
│       ├── navbar.tsx            # Mobile navbar
│       └── dashboard-layout.tsx  # Dashboard wrapper
├── hooks/
│   ├── useVehicles.ts            # Vehicle data hooks
│   ├── useAnalytics.ts           # Analytics data hooks
│   └── useRole.ts                # Role-based access hook
├── lib/
│   ├── auth-check.ts             # Authentication helpers
│   ├── auth.ts                   # NextAuth configuration
│   ├── validation.ts             # Zod schemas
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Utility functions
│   └── prisma.ts                 # Prisma client instance
├── messages/                     # i18n translation files
│   ├── en.json                   # English translations
│   └── id.json                   # Indonesian translations
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── docs/                         # Documentation
│   └── TECHNICAL.md              # Architecture & technical details
├── __tests__/                    # Unit tests
│   ├── utils.test.ts             # Utility tests
│   └── validation.test.ts        # Validation tests
├── middleware.ts                 # Route protection
├── tailwind.config.ts            # Tailwind configuration
├── __tests__/                    # Unit tests
│   ├── utils.test.ts             # Utility tests
│   └── validation.test.ts        # Validation tests
├── i18n.ts                       # i18n configuration (next-intl)
├── middleware.ts                 # Route protection & locale handling
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies

```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (recommended) or npm >= 9.0.0
- Docker (optional, for containerization)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd fleet-management-dashboard
```

2. Install dependencies:

```bash
pnpm install
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
pnpm run prisma:generate
pnpm run prisma:push
```

6. (Optional) Seed the database with sample data:

```bash
pnpm run prisma:seed
```

7. Start the development server:

```bash
pnpm dev
```

8. Open your browser:
   - English: [http://localhost:3000/en/dashboard](http://localhost:3000/en/dashboard)
   - Indonesian: [http://localhost:3000/id/dashboard](http://localhost:3000/id/dashboard)
   - Root (auto-redirects): [http://localhost:3000](http://localhost:3000)

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
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

### 📊 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run Jest tests
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:push` - Push schema to database
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:seed` - Seed database with Indonesian demo data

### 🌍 Language Support

The application supports two languages:

**English (Default)**

- Access: `/en/*` routes
- Example: `http://localhost:3000/en/dashboard`

**Indonesian (Bahasa Indonesia)**

- Access: `/id/*` routes
- Example: `http://localhost:3000/id/dashboard`

**Switching Languages:**

1. Click the language icon (🌐) in the sidebar
2. Select your preferred language from the dropdown
3. The interface will immediately switch to the selected language
4. URLs will update to reflect the chosen locale

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

- Next.js Server Actions for direct database access
- TanStack Query for client-side caching and mutations
- Optimistic updates for better UX
- Automatic cache revalidation with revalidatePath

### Type Safety

- Strict TypeScript configuration
- Zod schemas for runtime validation
- Type-safe API routes and responses
- End-to-end type safety from API to UI

For detailed documentation, see:

- [QUICK-START.md](QUICK-START.md) - Quick setup guide
- [docs/TECHNICAL.md](docs/TECHNICAL.md) - Architecture & technical details

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

### 4. Server Actions

```typescript
// Direct database access from server
export async function getVehicles() {
  const authResult = await checkAuth();
  if (!authResult.success) return { success: false, error: authResult.error };

  const vehicles = await prisma.vehicle.findMany();
  return { success: true, data: vehicles };
}
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Type checking
pnpm type-check
```

## 🔨 Build & Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables for Production

Ensure these are set:

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
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
- Next.js automatic cache revalidation
- TanStack Query staleTime configuration
- Suspense boundaries for progressive loading
- Locale-aware routing with next-intl (minimal runtime overhead)

See [docs/TECHNICAL.md](docs/TECHNICAL.md) for detailed technical documentation.

## 🎨 Design Decisions

### Why Next.js 15?

- Latest features (Server Actions, Partial Prerendering)
- Excellent TypeScript support
- Built-in optimizations
- Easy deployment
- Native i18n routing support

### Why next-intl?

- Seamless Next.js 15 App Router integration
- Type-safe translations
- Server Component support
- Automatic locale detection
- Zero runtime overhead for static messages

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

## 🔮 Future Improvements

- [x] Multi-language support (English & Indonesian) ✅
- [ ] Real-time updates with WebSockets
- [ ] Advanced filtering and search
- [ ] Export to PDF/Excel
- [ ] Additional language support (Arabic, etc.)
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] Advanced analytics with AI insights
- [ ] Mobile app (React Native)
- [ ] Integration with GPS tracking
- [ ] Maintenance scheduling system
- [ ] Voice commands for accessibility

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
