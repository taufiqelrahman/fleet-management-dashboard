"use server";

import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import { Prisma, ActivityType } from "@prisma/client";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

type TimesheetWithRelations = Prisma.TimesheetGetPayload<{
  include: { user: true; vehicle: true };
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

// Get active timesheets (no end time) for current user
export async function getActiveTimesheets(): Promise<
  ActionResponse<TimesheetWithRelations[]>
> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId: authResult.user.id,
        endTime: null,
      },
      include: { user: true, vehicle: true },
      orderBy: { startTime: "desc" },
    });

    return {
      success: true,
      data: timesheets,
    };
  } catch (error) {
    console.error("Get active timesheets error:", error);
    return {
      success: false,
      message: "Failed to fetch active timesheets",
    };
  }
}

// Get timesheet history for current user
export async function getTimesheetHistory(): Promise<
  ActionResponse<TimesheetWithRelations[]>
> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const timesheets = await prisma.timesheet.findMany({
      where: {
        userId: authResult.user.id,
        endTime: { not: null },
      },
      include: { user: true, vehicle: true },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: timesheets,
    };
  } catch (error) {
    console.error("Get timesheet history error:", error);
    return {
      success: false,
      message: "Failed to fetch timesheet history",
    };
  }
}

// Start a new timesheet
export async function startTimesheet(data: {
  activityType: string;
  vehicleId?: string;
  location?: string;
  description?: string;
}): Promise<ActionResponse<TimesheetWithRelations>> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    // Check if there's already an active timesheet
    const activeTimesheet = await prisma.timesheet.findFirst({
      where: {
        userId: authResult.user.id,
        endTime: null,
      },
    });

    if (activeTimesheet) {
      return {
        success: false,
        message: "You already have an active timesheet. Please end it first.",
      };
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        userId: authResult.user.id,
        activityType: data.activityType as ActivityType,
        vehicleId: data.vehicleId,
        startTime: new Date(),
        location: data.location,
        description: data.description,
      },
      include: { user: true, vehicle: true },
    });

    revalidatePath("/[locale]/dashboard/timesheets");

    return {
      success: true,
      data: timesheet as TimesheetWithRelations,
      message: "Timesheet started successfully",
    };
  } catch (error) {
    console.error("Start timesheet error:", error);
    return {
      success: false,
      message: "Failed to start timesheet",
    };
  }
}

// End a timesheet
export async function endTimesheet(
  timesheetId: string
): Promise<ActionResponse<TimesheetWithRelations>> {
  try {
    const authResult = await getAuthenticatedUser();
    if ("error" in authResult) {
      return { success: false, message: authResult.error };
    }

    const timesheet = await prisma.timesheet.findFirst({
      where: {
        id: timesheetId,
        userId: authResult.user.id,
      },
    });

    if (!timesheet) {
      return {
        success: false,
        message: "Timesheet not found",
      };
    }

    if (timesheet.endTime) {
      return {
        success: false,
        message: "Timesheet already ended",
      };
    }

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - new Date(timesheet.startTime).getTime()) / 1000 / 60
    ); // duration in minutes

    const updatedTimesheet = await prisma.timesheet.update({
      where: { id: timesheetId },
      data: {
        endTime,
        duration,
      },
      include: { user: true, vehicle: true },
    });

    revalidatePath("/[locale]/dashboard/timesheets");

    return {
      success: true,
      data: updatedTimesheet,
      message: "Timesheet ended successfully",
    };
  } catch (error) {
    console.error("End timesheet error:", error);
    return {
      success: false,
      message: "Failed to end timesheet",
    };
  }
}
