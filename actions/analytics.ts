"use server";

import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/auth-check";
import type { Prisma } from "@prisma/client";

// Response type
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

// Prisma result types
type VehicleWithFuelConsumption = Prisma.VehicleGetPayload<{
  select: { fuelConsumption: true };
}>;

type TripWithVehicle = Prisma.TripGetPayload<{
  include: { vehicle: true };
}>;

type VehicleWithTrips = Prisma.VehicleGetPayload<{
  include: {
    trips: {
      where: {
        startDate: { gte: Date };
      };
    };
  };
}>;

type Trip = Prisma.TripGetPayload<Record<string, never>>;

// Dashboard stats types
interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  averageConsumption: number;
  upcomingMaintenance: number;
}

interface MonthlyData {
  month: string;
  mileage: number;
  activeVehicles: number;
  inactiveVehicles: number;
}

interface DashboardData {
  stats: DashboardStats;
  monthlyData: MonthlyData[];
}

// Analytics types
interface FuelConsumption {
  month: string;
  consumption: number;
}

interface UtilizationRate {
  vehicle: string;
  rate: number;
}

interface DriverPerformance {
  driver: string;
  score: number;
}

interface AnalyticsData {
  fuelConsumption: FuelConsumption[];
  utilizationRate: UtilizationRate[];
  driverPerformance: DriverPerformance[];
}

interface DriverStats {
  totalDistance: number;
  totalFuel: number;
  tripCount: number;
}

// Get dashboard data
export async function getDashboardData(): Promise<
  ActionResponse<DashboardData>
> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    // Get dashboard stats from database
    const [totalVehicles, activeVehicles, vehicles, upcomingMaintenanceCount] =
      (await Promise.all([
        prisma.vehicle.count(),
        prisma.vehicle.count({
          where: { status: "ACTIVE" },
        }),
        prisma.vehicle.findMany({
          select: { fuelConsumption: true },
        }),
        prisma.vehicle.count({
          where: {
            nextMaintenance: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
            },
          },
        }),
      ])) as [number, number, VehicleWithFuelConsumption[], number];

    const averageConsumption: number =
      vehicles.length > 0
        ? vehicles.reduce((sum: number, v) => sum + v.fuelConsumption, 0) /
          vehicles.length
        : 0;

    const stats: DashboardStats = {
      totalVehicles,
      activeVehicles,
      averageConsumption: Number(averageConsumption.toFixed(2)),
      upcomingMaintenance: upcomingMaintenanceCount,
    };

    // Get monthly data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trips: TripWithVehicle[] = await prisma.trip.findMany({
      where: {
        startDate: {
          gte: sixMonthsAgo,
        },
      },
      include: {
        vehicle: true,
      },
    });

    // Group trips by month
    const monthlyMap = new Map<
      string,
      { mileage: number; vehicles: Set<string> }
    >();

    trips.forEach((trip) => {
      const month = new Date(trip.startDate).toLocaleString("en-US", {
        month: "short",
      });

      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { mileage: 0, vehicles: new Set() });
      }

      const data = monthlyMap.get(month)!;
      data.mileage += trip.distance;
      data.vehicles.add(trip.vehicleId);
    });

    const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries()).map(
      ([month, data]) => ({
        month,
        mileage: Math.round(data.mileage),
        activeVehicles: data.vehicles.size,
        inactiveVehicles: totalVehicles - data.vehicles.size,
      })
    );

    return {
      success: true,
      data: {
        stats,
        monthlyData,
      },
    };
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return {
      success: false,
      message: "Failed to fetch dashboard data",
    };
  }
}

// Get analytics data
export async function getAnalyticsData(): Promise<
  ActionResponse<AnalyticsData>
> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    // Get fuel consumption by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trips: Trip[] = await prisma.trip.findMany({
      where: {
        startDate: {
          gte: sixMonthsAgo,
        },
      },
    });

    const fuelByMonth = new Map<string, number>();
    trips.forEach((trip) => {
      const month = new Date(trip.startDate).toLocaleString("en-US", {
        month: "short",
      });
      fuelByMonth.set(month, (fuelByMonth.get(month) || 0) + trip.fuelUsed);
    });

    const fuelConsumption: FuelConsumption[] = Array.from(
      fuelByMonth.entries()
    ).map(([month, consumption]) => ({
      month,
      consumption: Math.round(consumption),
    }));

    // Get utilization rate per vehicle
    const vehicles: VehicleWithTrips[] = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: {
            startDate: {
              gte: sixMonthsAgo,
            },
          },
        },
      },
    });

    const utilizationRate: UtilizationRate[] = vehicles.map((vehicle) => {
      const tripCount = vehicle.trips.length;
      const maxTrips = 180; // Assume max 1 trip per day for 6 months
      const rate = Math.min((tripCount / maxTrips) * 100, 100);
      return {
        vehicle: vehicle.name,
        rate: Math.round(rate),
      };
    });

    // Get driver performance (based on fuel efficiency)
    const driverStats = new Map<string, DriverStats>();

    trips.forEach((trip) => {
      if (!trip.driverName) return;

      if (!driverStats.has(trip.driverName)) {
        driverStats.set(trip.driverName, {
          totalDistance: 0,
          totalFuel: 0,
          tripCount: 0,
        });
      }

      const stats = driverStats.get(trip.driverName)!;
      stats.totalDistance += trip.distance;
      stats.totalFuel += trip.fuelUsed;
      stats.tripCount += 1;
    });

    const driverPerformance: DriverPerformance[] = Array.from(
      driverStats.entries()
    ).map(([driver, stats]) => {
      // Calculate score: lower fuel consumption per km = higher score
      const fuelEfficiency = stats.totalFuel / stats.totalDistance;
      const score = Math.min(Math.round((15 / fuelEfficiency) * 10), 100);
      return { driver, score };
    });

    return {
      success: true,
      data: {
        fuelConsumption,
        utilizationRate,
        driverPerformance,
      },
    };
  } catch (error) {
    console.error("Get analytics data error:", error);
    return {
      success: false,
      message: "Failed to fetch analytics data",
    };
  }
}
