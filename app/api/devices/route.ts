import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";

/**
 * Get all devices for the current user
 * GET /api/devices
 */
export async function GET() {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const devices = await prisma.device.findMany({
      where: { userId },
      orderBy: { lastActive: "desc" },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Failed to fetch devices" },
      { status: 500 }
    );
  }
}

/**
 * Register a new device
 * POST /api/devices
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      deviceType,
      browser,
      browserVersion,
      os,
      osVersion,
      deviceFingerprint,
      ipAddress,
      location,
    } = body;

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: "Device fingerprint is required" },
        { status: 400 }
      );
    }

    const existingDevice = await prisma.device.findUnique({
      where: { deviceFingerprint },
    });

    if (existingDevice) {
      const updatedDevice = await prisma.device.update({
        where: { id: existingDevice.id },
        data: {
          lastActive: new Date(),
          lastLoginAt: new Date(),
          isActive: true,
        },
      });
      return NextResponse.json({ device: updatedDevice });
    }

    const device = await prisma.device.create({
      data: {
        userId,
        name: name || `${deviceType} - ${os} ${browser}`,
        deviceType: deviceType || "desktop",
        browser: browser || "Unknown",
        browserVersion,
        os: os || "Unknown",
        osVersion,
        deviceFingerprint,
        ipAddress,
        location,
        lastActive: new Date(),
        lastLoginAt: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json({ device }, { status: 201 });
  } catch (error) {
    console.error("Error creating device:", error);
    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }
}
