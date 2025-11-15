import { NextResponse } from "next/server";
import {
  mockDashboardStats,
  mockMonthlyData,
  mockAnalyticsData,
} from "@/lib/mock-data";
import { getCachedData, setCachedData } from "@/lib/cache";

const DASHBOARD_CACHE_KEY = "dashboard-stats";
const MONTHLY_CACHE_KEY = "monthly-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "dashboard") {
      const cachedStats = getCachedData(DASHBOARD_CACHE_KEY);

      if (cachedStats) {
        return NextResponse.json({
          data: {
            stats: cachedStats,
            monthlyData: mockMonthlyData,
          },
          success: true,
          cached: true,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      setCachedData(DASHBOARD_CACHE_KEY, mockDashboardStats);
      setCachedData(MONTHLY_CACHE_KEY, mockMonthlyData);

      return NextResponse.json({
        data: {
          stats: mockDashboardStats,
          monthlyData: mockMonthlyData,
        },
        success: true,
        cached: false,
      });
    }

    if (type === "analytics") {
      const cachedAnalytics = getCachedData("analytics-data");

      if (cachedAnalytics) {
        return NextResponse.json({
          data: cachedAnalytics,
          success: true,
          cached: true,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      setCachedData("analytics-data", mockAnalyticsData);

      return NextResponse.json({
        data: mockAnalyticsData,
        success: true,
        cached: false,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid analytics type" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
