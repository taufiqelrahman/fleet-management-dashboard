import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, context: RouteContext) {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const id = context.params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          orderBy: {
            startDate: "desc",
          },
          take: 50, // Limit to last 50 trips
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: vehicle,
      success: true,
    });
  } catch (error) {
    console.error("Get vehicle detail error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch vehicle details" },
      { status: 500 }
    );
  }
}
