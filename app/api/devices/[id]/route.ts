import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";

/**
 * Update device
 * PATCH /api/devices/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { id } = await params;
    const body = await request.json();

    const device = await prisma.device.findFirst({
      where: { id, userId },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const updatedDevice = await prisma.device.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ device: updatedDevice });
  } catch (error) {
    console.error("Error updating device:", error);
    return NextResponse.json(
      { error: "Failed to update device" },
      { status: 500 }
    );
  }
}

/**
 * Delete device (logout from device)
 * DELETE /api/devices/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAuth();
    if (!authResult.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (authResult.session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const { id } = await params;

    const device = await prisma.device.findFirst({
      where: { id, userId },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    await prisma.device.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Device removed successfully",
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: "Failed to delete device" },
      { status: 500 }
    );
  }
}
