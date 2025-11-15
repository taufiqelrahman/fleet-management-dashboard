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

interface VehicleStatusChartProps {
  data: Array<{
    month: string;
    activeVehicles: number;
    inactiveVehicles: number;
  }>;
}

export function VehicleStatusChart({ data }: VehicleStatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="activeVehicles" fill="#10b981" name="Active" />
        <Bar dataKey="inactiveVehicles" fill="#ef4444" name="Inactive" />
      </BarChart>
    </ResponsiveContainer>
  );
}
