# Vercel Deployment Setup

## Environment Variables Configuration

Add these environment variables in your Vercel project settings:

### 1. Via Vercel Dashboard

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables

| Variable                       | Value                                                                                     | Environment                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------- |
| `DATABASE_URL`                 | Your PostgreSQL connection string                                                         | Production, Preview, Development |
| `NEXTAUTH_URL`                 | Your production URL (e.g., `https://your-app.vercel.app`)                                 | Production                       |
| `NEXTAUTH_SECRET`              | Random secret (generate with `openssl rand -base64 32`)                                   | Production, Preview, Development |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `BP9P64R_WXqSB9dZxrzF-KWQmuVCVFi7X4fP_DLu-2pKP1MiBarOy2ArY-xZsZqaj5-ZHw2iW7x9_vA7RpxTgqA` | Production, Preview, Development |
| `VAPID_PRIVATE_KEY`            | `EPV7SfLguOBFp2WTcRVkfC5uyFs8p4c-MGs_WH0DJxE`                                             | Production, Preview, Development |

#### Optional Variables

| Variable                          | Value                           | Environment                      |
| --------------------------------- | ------------------------------- | -------------------------------- |
| `GOOGLE_CLIENT_ID`                | Your Google OAuth client ID     | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET`            | Your Google OAuth client secret | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key        | Production, Preview, Development |

### 2. Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (run in project root)
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY
# When prompted, paste: BP9P64R_WXqSB9dZxrzF-KWQmuVCVFi7X4fP_DLu-2pKP1MiBarOy2ArY-xZsZqaj5-ZHw2iW7x9_vA7RpxTgqA
# Select environments: Production, Preview, Development

vercel env add VAPID_PRIVATE_KEY
# When prompted, paste: EPV7SfLguOBFp2WTcRVkfC5uyFs8p4c-MGs_WH0DJxE
# Select environments: Production, Preview, Development

vercel env add DATABASE_URL
# Paste your database connection string

vercel env add NEXTAUTH_SECRET
# Generate with: openssl rand -base64 32

vercel env add NEXTAUTH_URL
# Enter your production URL
```

### 3. Via `.env` File (Pull from Vercel)

```bash
# Pull environment variables from Vercel to local .env file
vercel env pull .env.local
```

## Local Development Setup

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your VAPID keys:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BP9P64R_WXqSB9dZxrzF-KWQmuVCVFi7X4fP_DLu-2pKP1MiBarOy2ArY-xZsZqaj5-ZHw2iW7x9_vA7RpxTgqA"
VAPID_PRIVATE_KEY="EPV7SfLguOBFp2WTcRVkfC5uyFs8p4c-MGs_WH0DJxE"
```

## Deployment

### First Deployment

```bash
# Deploy to Vercel
vercel

# Or deploy to production directly
vercel --prod
```

### Subsequent Deployments

```bash
# Deploy preview
git push

# Deploy to production
vercel --prod
```

## Database Setup on Vercel

### Option 1: Vercel Postgres

1. Go to your Vercel project
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option 2: External Database (Supabase, Neon, Railway, etc.)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Add it as `DATABASE_URL` environment variable in Vercel

### Run Migrations

After setting up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

## Testing Push Notifications

1. Deploy your app to Vercel
2. Visit your deployed URL
3. Click the notification toggle in the UI
4. Grant permission when prompted
5. Test by triggering any notification event (e.g., vehicle alert, attendance check-in)

## Troubleshooting

### Push Notifications Not Working

1. Verify VAPID keys are set correctly in Vercel environment variables
2. Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` starts with `NEXT_PUBLIC_` prefix
3. Check browser console for errors
4. Verify Service Worker is registered (check DevTools → Application → Service Workers)
5. Ensure you're using HTTPS (required for push notifications)

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if database allows connections from Vercel IPs
3. Ensure SSL is enabled if required: `?sslmode=require`

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript types are correct
4. Run `pnpm build` locally to test

## Security Notes

⚠️ **Important Security Reminders:**

1. **Never commit** `.env.local` or `.env` files to version control
2. **Rotate keys** if they are exposed
3. **Use different keys** for production and development
4. **Keep `VAPID_PRIVATE_KEY` secret** - only add to server environments
5. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` can be public (it's sent to clients)

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
