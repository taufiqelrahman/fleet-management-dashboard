import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, deleteCachedData } from "@/lib/cache";

const CACHE_KEY = "vehicles";

export async function GET() {
  try {
    const cachedVehicles = getCachedData(CACHE_KEY);

    if (cachedVehicles) {
      return NextResponse.json({
        data: cachedVehicles,
        success: true,
        cached: true,
      });
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    setCachedData(CACHE_KEY, vehicles);

    return NextResponse.json({
      data: vehicles,
      success: true,
      cached: false,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newVehicle = await prisma.vehicle.create({
      data: {
        name: body.name,
        type: body.type,
        licensePlate: body.licensePlate,
        status: body.status || "ACTIVE",
        driverId: body.driverId,
        driverName: body.driverName,
        lastMaintenance: body.lastMaintenance
          ? new Date(body.lastMaintenance)
          : null,
        nextMaintenance: body.nextMaintenance
          ? new Date(body.nextMaintenance)
          : null,
        mileage: body.mileage || 0,
        fuelConsumption: body.fuelConsumption || 0,
      },
    });

    deleteCachedData(CACHE_KEY);
    deleteCachedData("dashboard-stats");
    deleteCachedData("analytics-data");

    return NextResponse.json({
      data: newVehicle,
      success: true,
      message: "Vehicle created successfully",
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Vehicle ID is required" },
        { status: 400 }
      );
    }

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

    deleteCachedData(CACHE_KEY);
    deleteCachedData("dashboard-stats");
    deleteCachedData("analytics-data");

    return NextResponse.json({
      data: updatedVehicle,
      success: true,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    deleteCachedData(CACHE_KEY);
    deleteCachedData("dashboard-stats");
    deleteCachedData("analytics-data");

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
