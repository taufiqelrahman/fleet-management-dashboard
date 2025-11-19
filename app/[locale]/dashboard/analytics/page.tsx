"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FuelConsumptionChart } from "@/components/charts/fuel-consumption-chart";
import { UtilizationRateChart } from "@/components/charts/utilization-rate-chart";
import { DriverPerformanceChart } from "@/components/charts/driver-performance-chart";
import { useAnalyticsData } from "@/hooks/useAnalytics";
import { useTranslations } from "next-intl";

export default function AnalyticsPage() {
  const t = useTranslations();
  const { data, isLoading, error } = useAnalyticsData();

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">{t("errors.generic")}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("analytics.title")}
          </h1>
          <p className="text-muted-foreground">{t("analytics.description")}</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">{t("common.loading")}</div>
        ) : (
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.fuelConsumption")}</CardTitle>
              </CardHeader>
              <CardContent>
                <FuelConsumptionChart data={data?.fuelConsumption || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.utilizationRate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <UtilizationRateChart data={data?.utilizationRate || []} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.driverPerformance")}</CardTitle>
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
