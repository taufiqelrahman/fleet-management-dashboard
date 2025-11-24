"use server";

import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import { Prisma, ShiftType, ShiftStatus } from "@prisma/client";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

type ShiftWithUser = Prisma.ShiftGetPayload<{
  include: { user: true };
}>;

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return { error: "Unauthorized" };
  }

  const userEmail = authCheck.session.user?.email;
  if (!userEmail) {
    return { error: "User email not found" };
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    return { error: "User not found" };
  }

  return { user };
}

// Get today's shifts for current user
export async function getTodayShifts(): Promise<
  ActionResponse<ShiftWithUser[]>
> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shifts = await prisma.shift.findMany({
      where: {
        userId: authResult.user.id,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: { user: true },
      orderBy: { startTime: "asc" },
    });

    return {
      success: true,
      data: shifts,
    };
  } catch (error) {
    console.error("Get today shifts error:", error);
    return {
      success: false,
      message: "Failed to fetch today's shifts",
    };
  }
}

// Get upcoming shifts (next 7 days) for current user
export async function getUpcomingShifts(): Promise<
  ActionResponse<ShiftWithUser[]>
> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const shifts = await prisma.shift.findMany({
      where: {
        userId: authResult.user.id,
        startTime: {
          gte: now,
          lte: nextWeek,
        },
        status: {
          in: ["SCHEDULED", "ONGOING"],
        },
      },
      include: { user: true },
      orderBy: { startTime: "asc" },
      take: 20,
    });

    return {
      success: true,
      data: shifts,
    };
  } catch (error) {
    console.error("Get upcoming shifts error:", error);
    return {
      success: false,
      message: "Failed to fetch upcoming shifts",
    };
  }
}

// Get all shifts history for current user
export async function getAllShifts(): Promise<ActionResponse<ShiftWithUser[]>> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const shifts = await prisma.shift.findMany({
      where: { userId: authResult.user.id },
      include: { user: true },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: shifts,
    };
  } catch (error) {
    console.error("Get all shifts error:", error);
    return {
      success: false,
      message: "Failed to fetch shifts",
    };
  }
}

// Create a new shift
export async function createShift(data: {
  shiftType: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}): Promise<ActionResponse<ShiftWithUser>> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    // Validate times
    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return {
        success: false,
        message: "End time must be after start time",
      };
    }

    // Check for overlapping shifts
    const overlapping = await prisma.shift.findFirst({
      where: {
        userId: authResult.user.id,
        status: {
          in: ["SCHEDULED", "ONGOING"],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gte: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lte: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return {
        success: false,
        message: "This shift overlaps with an existing shift",
      };
    }

    const shift = await prisma.shift.create({
      data: {
        userId: authResult.user.id,
        shiftType: data.shiftType as ShiftType,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: "SCHEDULED",
        notes: data.notes,
      },
      include: { user: true },
    });

    revalidatePath("/[locale]/dashboard/schedules");

    return {
      success: true,
      data: shift,
      message: "Shift created successfully",
    };
  } catch (error) {
    console.error("Create shift error:", error);
    return {
      success: false,
      message: "Failed to create shift",
    };
  }
}

// Update shift status
export async function updateShiftStatus(
  shiftId: string,
  status: string
): Promise<ActionResponse<ShiftWithUser>> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const shift = await prisma.shift.findFirst({
      where: {
        id: shiftId,
        userId: authResult.user.id,
      },
    });

    if (!shift) {
      return {
        success: false,
        message: "Shift not found",
      };
    }

    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: { status: status as ShiftStatus },
      include: { user: true },
    });

    revalidatePath("/[locale]/dashboard/schedules");

    return {
      success: true,
      data: updatedShift,
      message: "Shift status updated successfully",
    };
  } catch (error) {
    console.error("Update shift status error:", error);
    return {
      success: false,
      message: "Failed to update shift status",
    };
  }
}
