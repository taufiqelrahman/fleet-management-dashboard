"use server";

import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

type AttendanceWithUser = Prisma.AttendanceGetPayload<{
  include: { user: true };
}>;

// Get today's attendance for current user
export async function getTodayAttendance(): Promise<ActionResponse<AttendanceWithUser | null>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const userEmail = authCheck.session.user?.email;
    if (!userEmail) {
      return { success: false, message: "User not found" };
    }

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({ 
      where: { 
        userId: user.id, 
        date: { gte: today } 
      },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
    
    return {
      success: true,
      data: attendance,
    };
  } catch (error) {
    console.error("Get today attendance error:", error);
    return {
      success: false,
      message: "Failed to fetch attendance",
    };
  }
}

// Get attendance history for current user
export async function getAttendanceHistory(): Promise<ActionResponse<AttendanceWithUser[]>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const userEmail = authCheck.session.user?.email;
    if (!userEmail) {
      return { success: false, message: "User not found" };
    }

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const attendances = await prisma.attendance.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { date: "desc" },
      take: 30
    });
    
    return {
      success: true,
      data: attendances,
    };
  } catch (error) {
    console.error("Get attendance history error:", error);
    return {
      success: false,
      message: "Failed to fetch attendance history",
    };
  }
}

// Clock in
export async function clockIn(data: {
  location?: string;
  notes?: string;
}): Promise<ActionResponse<AttendanceWithUser>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const userEmail = authCheck.session.user?.email;
    if (!userEmail) {
      return { success: false, message: "User not found" };
    }

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        date: { gte: today },
      },
    });

    if (existingAttendance) {
      return {
        success: false,
        message: "Already clocked in today",
      };
    }

    // Determine status based on time (late if after 9 AM)
    const hour = now.getHours();
    const status = hour > 9 ? "LATE" : "PRESENT";

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: today,
        clockIn: now,
        status,
        location: data.location,
        notes: data.notes,
      },
      include: { user: true },
    });
    
    revalidatePath("/[locale]/dashboard/attendance");
    
    return {
      success: true,
      data: attendance,
      message: "Clocked in successfully",
    };
  } catch (error) {
    console.error("Clock in error:", error);
    return {
      success: false,
      message: "Failed to clock in",
    };
  }
}

// Clock out
export async function clockOut(attendanceId: string): Promise<ActionResponse<AttendanceWithUser>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const userEmail = authCheck.session.user?.email;
    if (!userEmail) {
      return { success: false, message: "User not found" };
    }

    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.userId !== user.id) {
      return {
        success: false,
        message: "Attendance record not found",
      };
    }

    if (attendance.clockOut) {
      return {
        success: false,
        message: "Already clocked out",
      };
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { clockOut: new Date() },
      include: { user: true },
    });
    
    revalidatePath("/[locale]/dashboard/attendance");
    
    return {
      success: true,
      data: updatedAttendance,
      message: "Clocked out successfully",
    };
  } catch (error) {
    console.error("Clock out error:", error);
    return {
      success: false,
      message: "Failed to clock out",
    };
  }
}
