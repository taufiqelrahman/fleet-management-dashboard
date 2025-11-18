"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface UtilizationRateChartProps {
  data: Array<{
    vehicle: string;
    rate: number;
  }>;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#f59e0b",
  "#06b6d4",
];

export function UtilizationRateChart({ data }: UtilizationRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 3]} />
        <YAxis dataKey="vehicle" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="rate" name="Utilization Rate (%)">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
