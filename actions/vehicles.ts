"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkAuth, checkAdminAuth } from "@/lib/auth-check";
import { sendPushByRole } from "@/lib/push-notifications";
import { Prisma } from "@prisma/client";
import type { Vehicle, VehicleWithTrips } from "@/lib/types";

// Response type for server actions
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

// Get all vehicles
export async function getVehicles(): Promise<ActionResponse<Vehicle[]>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: vehicles as Vehicle[],
    };
  } catch (error) {
    console.error("Get vehicles error:", error);
    return {
      success: false,
      message: "Failed to fetch vehicles",
    };
  }
}

// Get single vehicle with trips
export async function getVehicleById(
  id: string
): Promise<ActionResponse<VehicleWithTrips>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          orderBy: {
            startDate: "desc",
          },
          take: 50,
        },
      },
    });

    if (!vehicle) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }

    return {
      success: true,
      data: vehicle as VehicleWithTrips,
    };
  } catch (error) {
    console.error("Get vehicle error:", error);
    return {
      success: false,
      message: "Failed to fetch vehicle",
    };
  }
}

// Create vehicle (Admin only)
export async function createVehicle(
  data: Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "trips">
): Promise<ActionResponse<Vehicle>> {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message:
        authCheck.response.status === 403
          ? "Forbidden: Admin access required"
          : "Unauthorized",
    };
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        type: data.type,
        licensePlate: data.licensePlate,
        status: data.status || "ACTIVE",
        driverId: data.driverId,
        driverName: data.driverName,
        lastMaintenance: data.lastMaintenance
          ? new Date(data.lastMaintenance)
          : null,
        nextMaintenance: data.nextMaintenance
          ? new Date(data.nextMaintenance)
          : null,
        mileage: data.mileage || 0,
        fuelConsumption: data.fuelConsumption || 0,
      },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/analytics");

    return {
      success: true,
      data: newVehicle as Vehicle,
      message: "Vehicle created successfully",
    };
  } catch (error) {
    console.error("Create vehicle error:", error);
    return {
      success: false,
      message: "Failed to create vehicle",
    };
  }
}

// Update vehicle (Admin only)
export async function updateVehicle(
  id: string,
  updates: Partial<Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "trips">>
): Promise<ActionResponse<Vehicle>> {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message:
        authCheck.response.status === 403
          ? "Forbidden: Admin access required"
          : "Unauthorized",
    };
  }

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name: updates.name,
        type: updates.type,
        licensePlate: updates.licensePlate,
        status: updates.status,
        driverId: updates.driverId,
        driverName: updates.driverName,
        lastMaintenance: updates.lastMaintenance
          ? new Date(updates.lastMaintenance)
          : undefined,
        nextMaintenance: updates.nextMaintenance
          ? new Date(updates.nextMaintenance)
          : undefined,
        mileage: updates.mileage,
        fuelConsumption: updates.fuelConsumption,
      },
    });

    // Check if status changed to MAINTENANCE and send notification
    const oldVehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (
      oldVehicle &&
      oldVehicle.status !== "MAINTENANCE" &&
      updates.status === "MAINTENANCE"
    ) {
      // Get all admins and operators to notify
      const usersToNotify = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "OPERATOR"] } },
        select: { id: true },
      });

      // Create notifications for vehicle status change
      await prisma.notification.createMany({
        data: usersToNotify.map((user) => ({
          userId: user.id,
          type: "VEHICLE_STATUS_CHANGE",
          title: "Vehicle Status Changed",
          message: `${updatedVehicle.name} (${updatedVehicle.licensePlate}) is now in maintenance`,
        })),
      });

      // Send push notification to admins and operators
      await sendPushByRole(["ADMIN", "OPERATOR"], {
        title: "Vehicle Maintenance Alert",
        body: `${updatedVehicle.name} (${updatedVehicle.licensePlate}) is now in maintenance`,
        icon: "/icon-192x192.png",
        data: {
          url: `/en/dashboard/vehicles/${id}`,
          vehicleId: id,
          type: "VEHICLE_STATUS_CHANGE",
        },
      });
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vehicles");
    revalidatePath(`/dashboard/vehicles/${id}`);
    revalidatePath("/dashboard/analytics");

    return {
      success: true,
      data: updatedVehicle as Vehicle,
      message: "Vehicle updated successfully",
    };
  } catch (error) {
    console.error("Update vehicle error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }

    return {
      success: false,
      message: "Failed to update vehicle",
    };
  }
}

// Delete vehicle (Admin only)
export async function deleteVehicle(id: string): Promise<ActionResponse> {
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message:
        authCheck.response.status === 403
          ? "Forbidden: Admin access required"
          : "Unauthorized",
    };
  }

  try {
    await prisma.vehicle.delete({
      where: { id },
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/analytics");

    return {
      success: true,
      message: "Vehicle deleted successfully",
    };
  } catch (error) {
    console.error("Delete vehicle error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        message: "Vehicle not found",
      };
    }

    return {
      success: false,
      message: "Failed to delete vehicle",
    };
  }
}
