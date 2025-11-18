import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextFleet - Fleet Management Dashboard",
  description: "Enterprise-grade fleet management system built with Next.js 15",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
