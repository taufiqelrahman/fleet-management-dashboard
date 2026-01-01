"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useDeviceRegistration } from "@/hooks/useDeviceRegistration";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useDeviceRegistration();

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
