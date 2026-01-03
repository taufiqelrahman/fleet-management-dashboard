import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextFleet - Fleet Management Dashboard",
  description: "Enterprise-grade fleet management system built with Next.js 16",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
