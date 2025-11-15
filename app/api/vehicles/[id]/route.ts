import { NextRequest, NextResponse } from "next/server";
import { mockVehicles, mockTrips } from "@/lib/mock-data";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const vehicle = mockVehicles.find((v) => v.id === id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    const trips = mockTrips[id] || [];

    return NextResponse.json({
      data: {
        ...vehicle,
        trips,
      },
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch vehicle details" },
      { status: 500 }
    );
  }
}
