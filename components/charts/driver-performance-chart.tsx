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

interface DriverPerformanceChartProps {
  data: Array<{
    driver: string;
    score: number;
  }>;
}

export function DriverPerformanceChart({ data }: DriverPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="driver" angle={-45} textAnchor="end" height={100} />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="score" fill="#8b5cf6" name="Performance Score" />
      </BarChart>
    </ResponsiveContainer>
  );
}
