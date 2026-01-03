"use server";

import { prisma } from "./prisma";
import {
  parseUserAgent,
  generateDeviceFingerprint,
  getDeviceDisplayName,
} from "./device-utils";

export interface LoginAttempt {
  userId: string;
  userAgent: string;
  ipAddress?: string;
}

/**
 * Track login attempt and send notification if from new device
 */
export async function trackLoginAttempt({
  userId,
  userAgent,
  ipAddress,
}: LoginAttempt): Promise<{
  isNewDevice: boolean;
  deviceName?: string;
}> {
  const deviceInfo = parseUserAgent(userAgent);
  const fingerprint = generateDeviceFingerprint({
    userId,
    userAgent,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
  });

  // Check if device exists
  const existingDevice = await prisma.device.findUnique({
    where: { deviceFingerprint: fingerprint },
  });

  if (existingDevice) {
    // Update last login
    await prisma.device.update({
      where: { id: existingDevice.id },
      data: {
        lastLoginAt: new Date(),
        lastActive: new Date(),
        ipAddress: ipAddress || existingDevice.ipAddress,
      },
    });

    return { isNewDevice: false };
  }

  // New device - create and send notification
  const deviceName = getDeviceDisplayName(deviceInfo);

  await prisma.device.create({
    data: {
      userId,
      name: deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      deviceFingerprint: fingerprint,
      ipAddress,
      lastLoginAt: new Date(),
      lastActive: new Date(),
      isTrusted: false,
    },
  });

  // Create notification for new device login
  await prisma.notification.create({
    data: {
      userId,
      type: "NEW_DEVICE_LOGIN",
      title: "New Device Login Detected",
      message: `Someone just logged in to your account from: ${deviceName}${
        ipAddress ? ` (IP: ${ipAddress})` : ""
      }. If this wasn't you, please change your password immediately.`,
      isRead: false,
    },
  });

  return { isNewDevice: true, deviceName };
}

/**
 * Check for suspicious login patterns
 */
export async function checkSuspiciousActivity(
  userId: string,
  ipAddress?: string
): Promise<boolean> {
  if (!ipAddress) return false;

  // Get recent logins from different IPs in last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentDevices = await prisma.device.findMany({
    where: {
      userId,
      lastLoginAt: {
        gte: oneHourAgo,
      },
    },
    select: {
      ipAddress: true,
      location: true,
    },
  });

  // Check if multiple different IPs in short time
  const uniqueIPs = new Set(
    recentDevices.map((d) => d.ipAddress).filter(Boolean)
  );

  // Suspicious if 3+ different IPs in 1 hour
  if (uniqueIPs.size >= 3 && !uniqueIPs.has(ipAddress)) {
    await prisma.notification.create({
      data: {
        userId,
        type: "SUSPICIOUS_LOGIN",
        title: "Suspicious Login Activity",
        message: `Multiple login attempts detected from different locations. Please verify your recent account activity and change your password if needed.`,
        isRead: false,
      },
    });

    return true;
  }

  return false;
}
