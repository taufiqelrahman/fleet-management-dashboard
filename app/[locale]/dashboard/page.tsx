"use client";

import { Suspense, useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyMileageChart } from "@/components/charts/monthly-mileage-chart";
import { VehicleStatusChart } from "@/components/charts/vehicle-status-chart";
import { FleetMap } from "@/components/maps/fleet-map";
import { useDashboardData } from "@/hooks/useAnalytics";
import { getVehicles } from "@/actions/vehicles";
import { Car, Activity, Gauge, Wrench, MapPin } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Vehicle } from "@/lib/types";

function DashboardStats() {
  const t = useTranslations();
  const { data, isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{t("errors.generic")}</div>;
  }

  const stats = data?.stats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.totalVehicles")}
          </CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalVehicles || 0}</div>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.fleetSize")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.activeVehicles")}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeVehicles || 0}</div>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.currentlyOperational")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.avgFuelConsumption")}
          </CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(stats?.averageConsumption || 0, 2)} L
          </div>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.per100km")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("dashboard.upcomingMaintenance")}
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.upcomingMaintenance || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.vehiclesCount")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FleetMapSection() {
  const t = useTranslations();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const result = await getVehicles();
        if (result.success && result.data) {
          setVehicles(result.data as Vehicle[]);
        }
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadVehicles();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t("map.fleetLocation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">{t("map.loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5" />
        <h2 className="text-xl font-semibold">{t("map.fleetLocation")}</h2>
      </div>
      <FleetMap vehicles={vehicles} />
    </div>
  );
}

function DashboardCharts() {
  const t = useTranslations();
  const { data } = useDashboardData();

  if (!data?.monthlyData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.monthlyMileage")}</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyMileageChart data={data.monthlyData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.vehicleStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleStatusChart data={data.monthlyData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.overview")}</p>
        </div>

        <Suspense fallback={<div>{t("common.loading")}</div>}>
          <DashboardStats />
          <DashboardCharts />
          <FleetMapSection />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
