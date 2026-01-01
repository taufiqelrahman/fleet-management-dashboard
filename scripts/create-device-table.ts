import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Device" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "deviceType" TEXT NOT NULL,
      "browser" TEXT NOT NULL,
      "browserVersion" TEXT,
      "os" TEXT NOT NULL,
      "osVersion" TEXT,
      "deviceFingerprint" TEXT NOT NULL,
      "ipAddress" TEXT,
      "location" TEXT,
      "lastLoginAt" TIMESTAMP(3),
      "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "isTrusted" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Device_deviceFingerprint_key" ON "Device"("deviceFingerprint");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Device_userId_idx" ON "Device"("userId");`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Device_deviceFingerprint_idx" ON "Device"("deviceFingerprint");`
  );

  await prisma.$executeRawUnsafe(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Device_userId_fkey'
      ) THEN
        ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("✅ Device table created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
