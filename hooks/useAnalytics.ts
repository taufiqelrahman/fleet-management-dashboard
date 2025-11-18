"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getAnalyticsData } from "@/actions/analytics";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const result = await getDashboardData();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }
      return result.data;
    },
    staleTime: 30000,
  });
}

export function useAnalyticsData() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const result = await getAnalyticsData();
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch analytics data");
      }
      return result.data;
    },
    staleTime: 30000,
  });
}
