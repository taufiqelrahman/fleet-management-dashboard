"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyMileageChartProps {
  data: Array<{
    month: string;
    mileage: number;
  }>;
}

export function MonthlyMileageChart({ data }: MonthlyMileageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="mileage"
          stroke="#2563eb"
          strokeWidth={2}
          name="Monthly Mileage (km)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
