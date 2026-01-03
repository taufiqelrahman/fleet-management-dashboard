import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";
import { parseUserAgent, generateDeviceFingerprint } from "@/lib/device-utils";

/**
 * Update device lastActive timestamp (heartbeat)
 * POST /api/devices/heartbeat
 */
export async function POST() {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Unknown";

    const deviceInfo = parseUserAgent(userAgent);
    const fingerprint = generateDeviceFingerprint({
      userId,
      userAgent,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });

    // Update lastActive for the current device
    await prisma.device.updateMany({
      where: {
        userId,
        deviceFingerprint: fingerprint,
      },
      data: {
        lastActive: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating device heartbeat:", error);
    return NextResponse.json(
      { error: "Failed to update device activity" },
      { status: 500 }
    );
  }
}
