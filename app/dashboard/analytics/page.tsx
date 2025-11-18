"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuelConsumptionChart } from "@/components/charts/fuel-consumption-chart";
import { UtilizationRateChart } from "@/components/charts/utilization-rate-chart";
import { DriverPerformanceChart } from "@/components/charts/driver-performance-chart";
import { useAnalyticsData } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const { data, isLoading, error } = useAnalyticsData();

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">Failed to load analytics data</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into fleet performance
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading analytics...</div>
        ) : (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <FuelConsumptionChart data={data?.fuelConsumption || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <UtilizationRateChart data={data?.utilizationRate || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Driver Performance Index</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverPerformanceChart data={data?.driverPerformance || []} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
