# Neon PostgreSQL Migration Guide

## Overview

This project now uses **Neon PostgreSQL** instead of SQLite for better scalability, performance, and production readiness.

## Why Neon?

- ✅ **Serverless PostgreSQL**: Auto-scaling, pay-per-use
- ✅ **Free Tier**: Perfect for development and small projects
- ✅ **Instant Provisioning**: Database ready in seconds
- ✅ **Built-in Pooling**: Better connection management
- ✅ **Database Branching**: Git-like workflow for databases
- ✅ **Production Ready**: Enterprise-grade PostgreSQL

## Quick Start

### 1. Create Neon Account

1. Visit [https://neon.tech](https://neon.tech)
2. Sign up (free, no credit card required)
3. Create a new project
4. Copy your connection string

### 2. Update Environment Variables

Update your `.env.local`:

```env
# Replace with your Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Initialize Database

```bash
# Generate Prisma Client for PostgreSQL
npm run prisma:generate

# Push schema to Neon database
npm run prisma:push

# Verify in Prisma Studio
npm run prisma:studio
```

### 4. Done! 🎉

Your app now uses Neon PostgreSQL. All existing code works without changes.

## Differences from SQLite

### Schema Changes

The Prisma schema has been updated:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Data Types

PostgreSQL uses more accurate data types:

- Better `DateTime` handling
- Native `UUID` support
- JSON columns available
- Full-text search capabilities

### Performance

- ✅ Better concurrent access
- ✅ More efficient queries
- ✅ Built-in connection pooling
- ✅ Real-time query insights in Neon dashboard

## Development Workflow

### Viewing Data

```bash
# Open Prisma Studio
npm run prisma:studio
```

Or view directly in [Neon Console](https://console.neon.tech)

### Making Schema Changes

```bash
# For development: push changes directly
npm run prisma:push

# For production: use migrations
npm run prisma:migrate
```

### Database Branching

Neon supports database branching like Git:

1. Go to Neon Console
2. Create a branch from your main database
3. Test changes in the branch
4. Merge when ready

## Troubleshooting

### Connection Issues

**Error**: "Can't reach database server"

**Solution**:

- Check your connection string format
- Ensure `?sslmode=require` is present
- Verify network connectivity

### Schema Sync Issues

**Error**: "Schema out of sync"

**Solution**:

```bash
# Reset and push schema
npx prisma migrate reset --force
npm run prisma:push
```

### Performance Issues

**Solution**:

- Use connection pooling (see below)
- Check query performance in Neon dashboard
- Add database indexes if needed

## Advanced: Connection Pooling

For production, use Neon's pooled connection:

### Update `.env.local`:

```env
# Direct connection (for migrations)
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require"

# Pooled connection (for app)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.neon.tech/db?sslmode=require"
```

### Update `schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

## Migration from SQLite

If you had existing SQLite data:

### Option 1: Manual Migration

1. Export data from SQLite
2. Import to Neon using Prisma Studio or SQL

### Option 2: Start Fresh

```bash
# Push new schema
npm run prisma:push

# Use mock data (already in project)
# Mock data is served from lib/mock-data.ts
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-random-string"
```

### Vercel Deployment

1. Add Neon integration in Vercel dashboard
2. Environment variables auto-configured
3. Deploy normally

### Docker Deployment

Update `docker-compose.yml` environment:

```yaml
environment:
  - DATABASE_URL=postgresql://...
  - NEXTAUTH_URL=http://localhost:3000
  - NEXTAUTH_SECRET=your-secret
```

## Monitoring

### Neon Dashboard

Monitor your database:

- Query performance
- Connection count
- Storage usage
- Compute usage

Access at: [https://console.neon.tech](https://console.neon.tech)

### Prisma Studio

Visual database browser:

```bash
npm run prisma:studio
```

## Cost Considerations

### Free Tier Limits

- 0.5 GB storage
- 10 GB data transfer/month
- Shared compute

### When to Upgrade

Consider paid plan when:

- Storage > 500 MB
- Traffic > 10 GB/month
- Need dedicated compute
- Require backups/branching

## Security Best Practices

1. ✅ Never commit `.env.local`
2. ✅ Use different databases for dev/staging/prod
3. ✅ Rotate credentials regularly
4. ✅ Enable IP allowlisting (if needed)
5. ✅ Use connection pooling in production
6. ✅ Monitor unauthorized access attempts

## Rollback to SQLite (If Needed)

To revert to SQLite:

1. Update `schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update `.env.local`:

```env
DATABASE_URL="file:./dev.db"
```

3. Regenerate:

```bash
npm run prisma:generate
npm run prisma:push
```

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Neon + Next.js Guide](https://neon.tech/docs/guides/nextjs)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

## Support

- Neon: [https://neon.tech/docs/introduction](https://neon.tech/docs/introduction)
- Prisma: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- Project Issues: Check documentation in `/docs` folder
