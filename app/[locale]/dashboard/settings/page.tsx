"use client";

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import DeviceManager from "@/components/device-manager";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t("loginSessions")}</h2>
            <DeviceManager />
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
