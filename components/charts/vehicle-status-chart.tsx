"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

interface VehicleStatusChartProps {
  data: Array<{
    month: string;
    activeVehicles: number;
    inactiveVehicles: number;
  }>;
}

export function VehicleStatusChart({ data }: VehicleStatusChartProps) {
  const t = useTranslations();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="activeVehicles"
          fill="#10b981"
          name={t("vehicles.status.active")}
        />
        <Bar
          dataKey="inactiveVehicles"
          fill="#ef4444"
          name={t("vehicles.status.inactive")}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
