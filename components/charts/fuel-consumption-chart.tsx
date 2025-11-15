"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FuelConsumptionChartProps {
  data: Array<{
    month: string;
    consumption: number;
  }>;
}

export function FuelConsumptionChart({ data }: FuelConsumptionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="consumption" fill="#f59e0b" name="Fuel (L)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
