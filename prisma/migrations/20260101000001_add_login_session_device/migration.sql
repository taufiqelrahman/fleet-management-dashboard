-- CreateTable
CREATE TABLE "Device" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceFingerprint_key" ON "Device"("deviceFingerprint");

-- CreateIndex
CREATE INDEX "Device_userId_idx" ON "Device"("userId");

-- CreateIndex
CREATE INDEX "Device_deviceFingerprint_idx" ON "Device"("deviceFingerprint");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
