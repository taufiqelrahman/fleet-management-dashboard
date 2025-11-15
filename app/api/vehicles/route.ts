import { NextResponse } from "next/server";
import { mockVehicles } from "@/lib/mock-data";
import { getCachedData, setCachedData, deleteCachedData } from "@/lib/cache";
import type { Vehicle } from "@/lib/types";

const CACHE_KEY = "vehicles";

export async function GET() {
  try {
    const cachedVehicles = getCachedData<Vehicle[]>(CACHE_KEY);

    if (cachedVehicles) {
      return NextResponse.json({
        data: cachedVehicles,
        success: true,
        cached: true,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    setCachedData(CACHE_KEY, mockVehicles);

    return NextResponse.json({
      data: mockVehicles,
      success: true,
      cached: false,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newVehicle: Vehicle = {
      id: `v${Date.now()}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vehicles = [...mockVehicles, newVehicle];
    setCachedData(CACHE_KEY, vehicles);
    mockVehicles.push(newVehicle);

    return NextResponse.json({
      data: newVehicle,
      success: true,
      message: "Vehicle created successfully",
    });
  } catch (error) {
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

    const index = mockVehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    mockVehicles[index] = {
      ...mockVehicles[index],
      ...updates,
      updatedAt: new Date(),
    };

    deleteCachedData(CACHE_KEY);

    return NextResponse.json({
      data: mockVehicles[index],
      success: true,
      message: "Vehicle updated successfully",
    });
  } catch (error) {
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

    const index = mockVehicles.findIndex((v) => v.id === id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    mockVehicles.splice(index, 1);
    deleteCachedData(CACHE_KEY);

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}
