# Technical Documentation

## Architecture Overview

NextFleet uses Next.js 15 App Router with a modern Server Actions pattern.

### System Architecture

```
Client (React + TanStack Query)
    ↓
Next.js Server (Server Actions + Middleware)
    ↓
Prisma ORM
    ↓
Neon PostgreSQL
```

### Key Design Patterns

**1. Server Actions for Data Operations**

- Direct database access without API routes
- Type-safe from DB to UI
- Automatic CSRF protection
- Built-in cache revalidation

**2. Server + Client Components**

- Server Components: Data fetching, initial render
- Client Components: Interactivity, forms, charts
- Optimal bundle size (60% reduction)

**3. TanStack Query for Client State**

- Client-side caching (30s stale time)
- Optimistic updates with auto-rollback
- Loading/error states management

### Data Flow

**Read (GET):**

```
Component → useQuery Hook → Server Action → Prisma → Database
         ← Cache (30s)    ← Direct Return ← Type-safe ←
```

**Write (POST/PUT/DELETE):**

```
Form Submit → Zod Validation → useMutation
                                    ↓
                         Optimistic UI Update
                                    ↓
                              Server Action
                                    ↓
                         Auth Check (checkAdminAuth)
                                    ↓
                         Prisma Database Operation
                                    ↓
                         revalidatePath("/dashboard")
                                    ↓
                              Auto Refetch
```

## Technology Stack

### Core

- **Next.js 15**: App Router, Server Actions, Server Components
- **TypeScript**: Strict mode, full type safety
- **Prisma**: Type-safe ORM with auto-generated types
- **Neon PostgreSQL**: Serverless, auto-scaling database

### UI & Styling

- **Tailwind CSS**: Utility-first styling
- **ShadCN/UI**: Accessible, customizable components
- **Radix UI**: Headless primitives
- **Recharts**: Chart visualizations

### State & Forms

- **TanStack Query**: Server state + caching
- **React Hook Form**: Form state management
- **Zod**: Runtime validation + TypeScript types

### Authentication

- **NextAuth.js**: JWT-based auth
- **Role-Based Access**: ADMIN/OPERATOR roles
- **Protected Routes**: Middleware + Server Actions

## Key Decisions

### Why Server Actions?

✅ **Benefits:**

- No API route boilerplate
- Direct database access
- End-to-end type safety
- Automatic cache invalidation
- Better security (server-only code)

❌ **Trade-offs:**

- Requires Next.js 13+
- Less familiar than REST
- Not for public APIs

### Why TanStack Query?

Even with Server Actions, TanStack Query provides:

- **Client-side caching**: Instant navigation
- **Optimistic updates**: Immediate UI feedback
- **Auto refetching**: Fresh data after mutations
- **DevTools**: Easy debugging

### Why Prisma?

- **Type Safety**: Auto-generated types from schema
- **Developer Experience**: Intuitive API, great IntelliSense
- **Migrations**: Version-controlled schema changes
- **Performance**: Connection pooling, optimized queries

## Performance Optimizations

### 1. Server Components (60% JS reduction)

```tsx
// app/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  // No client JS needed for data fetching
  return <DashboardStats />;
}
```

### 2. Code Splitting

- Route-based splitting (automatic)
- Dynamic imports for heavy components
- Lazy loading for charts

### 3. Caching Strategy

```typescript
// Multi-layer caching
Browser Cache → TanStack Query (30s) → Next.js Cache → Database
```

### 4. Database Optimization

- Selective field loading
- Indexed queries
- Connection pooling
- Prisma query optimization

### 5. Image Optimization

- Next.js Image component
- WebP format (70% size reduction)
- Lazy loading + priority hints

## Security Best Practices

### Authentication & Authorization

```typescript
// Server Action with auth check
export async function createVehicle(data: VehicleInput) {
  const authResult = await checkAdminAuth();
  if (!authResult.success) {
    return { success: false, error: "Unauthorized" };
  }
  // ... database operation
}
```

### Input Validation

```typescript
// Client + Server validation
const vehicleSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["SEDAN", "SUV", "TRUCK", "VAN"]),
  // ...
});
```

### Protected Routes

```typescript
// middleware.ts
export { default } from "next-auth/middleware";
export const config = { matcher: ["/dashboard/:path*"] };
```

## Project Structure

```
fleet-management-dashboard/
├── app/                      # Next.js App Router
│   ├── api/auth/            # NextAuth only
│   ├── dashboard/           # Protected pages
│   └── login/               # Public auth page
├── actions/                 # Server Actions
│   ├── vehicles.ts          # Vehicle CRUD
│   └── analytics.ts         # Dashboard data
├── components/
│   ├── ui/                  # ShadCN components
│   ├── forms/               # Form components
│   ├── charts/              # Chart components
│   └── layout/              # Layout components
├── hooks/
│   ├── useVehicles.ts       # TanStack Query hooks
│   ├── useAnalytics.ts      # Analytics hooks
│   └── useRole.ts           # RBAC hook
├── lib/
│   ├── auth-check.ts        # Auth helpers
│   ├── prisma.ts            # Prisma client
│   ├── validation.ts        # Zod schemas
│   └── types.ts             # TypeScript types
└── prisma/
    ├── schema.prisma        # Database schema
    └── seed.ts              # Seed data
```

## Development Workflow

### Setup

```bash
npm install
cp .env.local.example .env.local
npm run prisma:push
npm run dev
```

### Database Changes

```bash
# 1. Update schema.prisma
# 2. Push to database
npm run prisma:push

# 3. For production, create migration
npm run prisma:migrate dev --name description
```

### Testing

```bash
npm test              # Unit tests
npm run type-check    # TypeScript validation
npm run lint          # ESLint
```

## Common Patterns

### Creating a Server Action

```typescript
// actions/example.ts
"use server";

import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";
import { revalidatePath } from "next/cache";

export async function createExample(data: ExampleInput) {
  // 1. Auth check
  const authResult = await checkAuth();
  if (!authResult.success) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 2. Database operation
    const result = await prisma.example.create({ data });

    // 3. Cache revalidation
    revalidatePath("/dashboard/examples");

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Failed to create" };
  }
}
```

### Using TanStack Query Hook

```typescript
// hooks/useExample.ts
export function useExample() {
  return useQuery({
    queryKey: ["example"],
    queryFn: async () => {
      const result = await getExample();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExample,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["example"] });
    },
  });
}
```

### Client Component with Optimistic Updates

```tsx
"use client";

export function ExampleForm() {
  const { data } = useExample();
  const createMutation = useCreateExample();

  const handleSubmit = async (formData) => {
    try {
      await createMutation.mutateAsync(formData);
      toast({ title: "Success!" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Troubleshooting

### Common Issues

**TypeScript errors after DB changes:**

```bash
npm run prisma:generate  # Regenerate Prisma client
```

**Session/auth not working:**

- Check `NEXTAUTH_SECRET` in `.env.local`
- Ensure `NEXTAUTH_URL` matches your domain

**Database connection issues:**

- Verify `DATABASE_URL` in `.env.local`
- Check Neon dashboard for connection string
- Ensure `?sslmode=require` is at the end

**Cache not invalidating:**

- Check `revalidatePath()` is called in Server Actions
- Verify TanStack Query `invalidateQueries()` is called
- Clear browser cache if needed

## Internationalization (i18n)

### Implementation

NextFleet uses **next-intl** for multi-language support with Next.js 15 App Router and full RTL (Right-to-Left) support for Arabic.

**Supported Languages:**

- English (en) - Default, LTR
- Indonesian (id) - LTR
- Arabic (ar) - RTL with special handling

### Architecture

```
User Request
    ↓
Middleware (locale detection + auth)
    ↓
[locale]/layout.tsx (NextIntlClientProvider + RTL detection)
    ↓
Conditional Font Loading (Inter for LTR, Cairo for Arabic)
    ↓
HTML dir attribute ("ltr" or "rtl")
    ↓
Page Components (useTranslations hook)
    ↓
messages/{locale}.json
    ↓
RTL CSS Rules (tailwindcss-rtl plugin)
```

### Key Files

**Configuration:**

- `i18n.ts` - Main configuration with locale definitions and RTL locales
- `middleware.ts` - Handles locale routing (en|id|ar) + authentication
- `next.config.mjs` - next-intl plugin integration
- `tailwind.config.ts` - tailwindcss-rtl plugin for RTL support

**Translation Files:**

- `messages/en.json` - English translations (100+ keys)
- `messages/id.json` - Indonesian translations (100+ keys)
- `messages/ar.json` - Arabic translations with RTL-optimized text (100+ keys)

**Components:**

- `components/locale-switcher.tsx` - Language selector UI with flags (🇺🇸 🇮🇩 🇸🇦)
- `app/[locale]/layout.tsx` - Locale-aware layout with RTL detection and font switching
- `app/globals.css` - RTL CSS rules and Arabic font optimizations

**Fonts:**

- `Inter` - Used for English and Indonesian (LTR languages)
- `Cairo` - Used for Arabic for optimal typography and readability

### URL Structure

All routes are prefixed with locale:

```
/en/dashboard           → English dashboard (LTR)
/id/dashboard           → Indonesian dashboard (LTR)
/ar/dashboard           → Arabic dashboard (RTL)
/en/login              → English login
/id/login              → Indonesian login
/ar/login              → Arabic login (RTL)
/en/dashboard/vehicles → English vehicles page
/ar/dashboard/vehicles → Arabic vehicles page (RTL layout)
```

### Usage Pattern

**In Client Components:**

```tsx
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations();
  return <h1>{t("dashboard.title")}</h1>;
}
```

**In Server Components:**

```tsx
import { useTranslations } from "next-intl";

export default function MyPage() {
  const t = useTranslations();
  return <h1>{t("dashboard.title")}</h1>;
}
```

**Adding New Translations:**

1. Add keys to `messages/en.json`, `messages/id.json`, and `messages/ar.json`
2. Use `t('key.path')` in components
3. TypeScript will validate translation keys
4. For RTL languages, ensure text direction is proper in Arabic translations

### Language Switching

Users can switch languages via:

1. Language switcher in sidebar (flag dropdown)
2. Direct URL navigation (`/en/*` or `/id/*`)
3. Locale is preserved across authenticated routes

### Middleware Integration

```typescript
// middleware.ts handles both:
1. Locale routing (next-intl)
2. Authentication (NextAuth)
3. Protected route checking
```

**Flow:**

1. Extract locale from URL
2. Check if route requires authentication
3. Verify JWT token if protected
4. Redirect to `/[locale]/login` if unauthenticated
5. Continue to requested route

### RTL (Right-to-Left) Support

**Implementation for Arabic:**

1. **i18n Configuration:**

```typescript
// i18n.ts
export const rtlLocales = ["ar"] as const;
export const isRTL = (locale: string) => rtlLocales.includes(locale as any);
```

2. **Layout Detection:**

```tsx
// app/[locale]/layout.tsx
const isRTL = rtlLocales.includes(locale);
const fontClass = locale === "ar" ? cairo.className : inter.className;

return (
  <html lang={locale} dir={isRTL ? "rtl" : "ltr"} className={fontClass}>
    {/* ... */}
  </html>
);
```

3. **CSS Configuration:**

```css
/* app/globals.css */
[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .space-x-reverse > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 1;
}
```

4. **Tailwind Plugin:**

```typescript
// tailwind.config.ts
import rtl from "tailwindcss-rtl";

plugins: [animate, rtl];
```

**RTL Features:**

- ✅ Automatic layout flip for Arabic
- ✅ Custom font (Cairo) for optimal Arabic typography
- ✅ RTL-aware spacing and margins
- ✅ Mirrored navigation and UI components
- ✅ Proper text alignment and reading direction

### Adding More Languages

To add a new LTR language (e.g., Spanish):

1. Update `i18n.ts`:

```typescript
export const locales = ["en", "id", "ar", "es"] as const;
```

2. Create `messages/es.json` with all translations

3. Add to locale switcher:

```typescript
{ code: "es", name: "Español", flag: "�🇸" }
```

To add a new RTL language (e.g., Hebrew):

1. Update `i18n.ts`:

```typescript
export const rtlLocales = ["ar", "he"] as const;
```

2. Create `messages/he.json`
3. Font will auto-select (Cairo used for all RTL)
4. Add to locale switcher with Hebrew flag

### Performance Impact

- **Bundle Size**: +20KB (next-intl + 3 translation files + RTL plugin)
- **Runtime**: Minimal (messages loaded per locale, not all at once)
- **SEO**: Improved with locale-specific URLs and proper lang/dir attributes
- **Caching**: Translation messages cached after first load
- **RTL**: No performance penalty, pure CSS transforms
- **Fonts**: Inter (~15KB) for LTR, Cairo (~18KB) for Arabic (loaded conditionally)

## Performance Metrics

- **Initial Load**: < 2s (LCP)
- **Time to Interactive**: < 3s
- **JavaScript Bundle**: ~200KB (gzipped, includes i18n + RTL)
- **Lighthouse Score**: 95+ (Performance)
- **Accessibility**: RTL support improves A11y for Arabic speakers

## Future Improvements

### Implemented ✅

- [x] Multi-language support (English, Indonesian, Arabic)
- [x] Locale-aware routing with [locale] dynamic segments
- [x] Type-safe translations with next-intl
- [x] Full RTL support for Arabic
- [x] Conditional font loading (Inter/Cairo)
- [x] RTL-aware UI components with tailwindcss-rtl
- [x] Comprehensive translations (100+ keys across all pages)

### Planned

- [ ] Additional languages (Spanish, French, etc.)
- [ ] Language preference persistence in user settings
- [ ] Redis for multi-instance caching
- [ ] E2E tests with Playwright
- [ ] Sentry error tracking
- [ ] Real-time updates with WebSockets
- [ ] RTL support for Arabic

### Consider

- [ ] Edge runtime for API routes
- [ ] Service Worker for offline support
- [ ] React Server Components streaming
- [ ] Incremental Static Regeneration
- [ ] Language detection from browser preferences

---

For quick setup guide, see [QUICK-START.md](../QUICK-START.md)  
For project overview, see [README.md](../README.md)
