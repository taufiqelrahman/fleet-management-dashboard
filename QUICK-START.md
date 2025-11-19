# 🚀 Quick Start - Neon PostgreSQL Setup

## 1️⃣ Create Neon Account (1 minute)

```bash
# Go to: https://neon.tech
# Click "Sign Up" - Free, no credit card required
```

## 2️⃣ Create Database (30 seconds)

1. Click "Create Project"
2. Choose a name (e.g., "nextfleet-db")
3. Select region (closest to you)
4. Click "Create"

## 3️⃣ Copy Connection String

```
Your connection string will look like:
postgresql://neondb_owner:xxxxx@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

Click the "Copy" button next to connection string.

## 4️⃣ Update .env.local

```bash
# Open .env.local and paste your connection string
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run-openssl-rand-base64-32-to-generate"
```

## 5️⃣ Initialize Database

```bash
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed  # Optional: Seed with Indonesian demo data
```

## 6️⃣ Start Development

```bash
pnpm dev
```

**Visit:**

- English: http://localhost:3000/en/dashboard
- Indonesian: http://localhost:3000/id/dashboard
- Arabic (RTL): http://localhost:3000/ar/dashboard
- Auto-redirect: http://localhost:3000 (defaults to /en)

**Login with:**

- Email: `admin@nextfleet.com`
- Password: `password123`

---

## ✅ Verification Checklist

- [ ] Neon account created
- [ ] Project created in Neon
- [ ] Connection string copied
- [ ] `.env.local` updated
- [ ] `prisma:generate` executed successfully
- [ ] `prisma:push` executed successfully
- [ ] App running on localhost:3000
- [ ] Can login with demo credentials

---

## 🎯 Demo Credentials

**Admin:**

- Email: `admin@nextfleet.com`
- Password: `password123`

**Operator:**

- Email: `operator@nextfleet.com`
- Password: `password123`

---

## 🔧 Troubleshooting

### "Can't reach database server"

✅ **Solution:**

- Check connection string format
- Ensure `?sslmode=require` is at the end
- Verify network connection

### "Schema is not in sync"

✅ **Solution:**

```bash
npx prisma migrate reset --force
pnpm prisma:push
```

### "Module not found: @prisma/client"

✅ **Solution:**

```bash
pnpm install
pnpm prisma:generate
```

### Language not switching

✅ **Solution:**

- Clear browser cache
- Check URL includes locale (`/en/` or `/id/`)
- Click language switcher icon in sidebar (🌐)

---

## 📊 View Your Data

### Option 1: Prisma Studio (Local)

```bash
pnpm prisma:studio
```

### Option 2: Neon Console (Online)

Visit: https://console.neon.tech

---

## 🌍 Language Support

**Switching Languages:**

1. Look for the language dropdown in the sidebar
2. Click to open language selector
3. Select:
   - 🇺🇸 English (Left-to-Right)
   - 🇮🇩 Indonesia (Left-to-Right)
   - 🇸🇦 العربية (Right-to-Left with RTL layout)

**Direct URL Access:**

- English: Add `/en/` to URL (e.g., `/en/dashboard`)
- Indonesian: Add `/id/` to URL (e.g., `/id/dashboard`)
- Arabic: Add `/ar/` to URL (e.g., `/ar/dashboard`)

**RTL Support:**

- Arabic language automatically enables right-to-left layout
- UI components and navigation flip direction
- Cairo font for optimal Arabic typography
- All pages and forms fully support RTL

---

## 🎓 Next Steps

1. ✅ Explore the dashboard
2. ✅ Try creating/editing vehicles
3. ✅ Check analytics page
4. ✅ View your data in Prisma Studio
5. ✅ Review code in VS Code

---

## 📚 Documentation

- [README.md](README.md) - Complete project overview
- [docs/TECHNICAL.md](docs/TECHNICAL.md) - Architecture & technical details

---

## 💡 Pro Tips

### Free Tier Limits

- 0.5 GB storage
- 10 GB data transfer/month
- Perfect for development & demos

### Connection Pooling

For production, use pooled connection:

```
postgresql://user:pass@ep-xxx-pooler.neon.tech/db
```

### Database Branching

Test changes safely:

1. Create branch in Neon Console
2. Point dev environment to branch
3. Test changes
4. Merge when ready

---

**Total Setup Time: ~3 minutes** ⚡
