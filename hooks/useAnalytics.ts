"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  DashboardStats,
  MonthlyData,
  AnalyticsData,
  ApiResponse,
} from "@/lib/types";

export function useDashboardData() {
  return useQuery<
    ApiResponse<{
      stats: DashboardStats;
      monthlyData: MonthlyData[];
    }>
  >({
    queryKey: ["dashboard"],
    queryFn: () => apiClient.get("/api/analytics?type=dashboard"),
    staleTime: 30000,
  });
}

export function useAnalyticsData() {
  return useQuery<ApiResponse<AnalyticsData>>({
    queryKey: ["analytics"],
    queryFn: () => apiClient.get("/api/analytics?type=analytics"),
    staleTime: 30000,
  });
}
