# Setting up Neon PostgreSQL Database

## Step 1: Create Neon Account & Database

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string

## Step 2: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Neon connection string:

```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## Step 3: Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# (Optional) Seed database with mock data
npm run db:seed
```

## Step 4: Verify Database

```bash
# Open Prisma Studio to view your database
npm run prisma:studio
```

## Neon Connection String Format

Your Neon connection string will look like:

```
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require
```

Example:

```
postgresql://myuser:mypassword@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Neon Features

- **Serverless PostgreSQL**: Auto-scaling, pay-per-use
- **Free Tier**: 0.5 GB storage, 10 GB data transfer/month
- **Branching**: Git-like database branching
- **Instant Provisioning**: Database ready in seconds
- **Connection Pooling**: Built-in pooling for better performance

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check if your connection string is correct
2. Ensure `?sslmode=require` is at the end
3. Verify your IP is allowed (Neon allows all IPs by default)

### Migration Issues

If `prisma:push` fails:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset --force

# Then push again
npm run prisma:push
```

## Alternative: Using Prisma Migrate

For production, use migrations instead of `prisma push`:

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migrations to production
npx prisma migrate deploy
```

## Environment-Specific Databases

### Development

Use Neon's free tier or local PostgreSQL

### Staging

Create separate Neon project/branch

### Production

Use Neon Pro with:

- Automated backups
- Point-in-time recovery
- Higher connection limits
- Better performance

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate credentials regularly**
3. **Use different databases** for dev/staging/production
4. **Enable connection pooling** for production
5. **Monitor database usage** in Neon dashboard

## Connection Pooling (Optional)

For better performance in production, use Neon's pooled connection:

```env
# Direct connection (for migrations)
DATABASE_URL="postgresql://..."

# Pooled connection (for application)
DATABASE_URL="postgresql://...-pooler.neon.tech/..."
```

Then in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```
