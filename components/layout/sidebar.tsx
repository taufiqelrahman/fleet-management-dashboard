"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  BarChart3,
  Clock,
  ClipboardList,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/lib/types";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { NotificationCenter } from "./notification-center";
import { PushNotificationToggle } from "../push-notification-toggle";

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: t("nav.dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t("nav.vehicles"),
      href: `/${locale}/dashboard/vehicles`,
      icon: Car,
    },
    {
      title: t("nav.analytics"),
      href: `/${locale}/dashboard/analytics`,
      icon: BarChart3,
    },
    {
      title: t("nav.attendance"),
      href: `/${locale}/dashboard/attendance`,
      icon: Clock,
    },
    {
      title: t("nav.timesheets"),
      href: `/${locale}/dashboard/timesheets`,
      icon: ClipboardList,
    },
    {
      title: t("nav.schedules"),
      href: `/${locale}/dashboard/schedules`,
      icon: Calendar,
    },
  ];

  // Mobile sidebar - always expanded with additional controls
  if (mobile) {
    return (
      <aside className="flex w-64 flex-col border-r bg-card h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">NextFleet</h1>
          <p className="text-sm text-muted-foreground">Fleet Management</p>
        </div>

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs mt-1",
                  (session?.user as User)?.role === "ADMIN" &&
                    "bg-red-500/10 text-red-700 border-red-300",
                  (session?.user as User)?.role === "SUPERVISOR" &&
                    "bg-blue-500/10 text-blue-700 border-blue-300",
                  (session?.user as User)?.role === "HR" &&
                    "bg-purple-500/10 text-purple-700 border-purple-300",
                  (session?.user as User)?.role === "OPERATOR" &&
                    "bg-green-500/10 text-green-700 border-green-300",
                  (session?.user as User)?.role === "EMPLOYEE" &&
                    "bg-gray-500/10 text-gray-700 border-gray-300"
                )}
              >
                {(session?.user as User)?.role
                  ? t(`roles.${(session?.user as User).role.toLowerCase()}`)
                  : t("roles.viewer")}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 px-3">
            <LocaleSwitcher />
            <PushNotificationToggle />
            <NotificationCenter />
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          >
            <LogOut className="h-4 w-4" />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>
    );
  }

  // Desktop sidebar - collapsible
  return (
    <aside
      className={cn(
        "flex-col border-r bg-card transition-all duration-300 hidden md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn("p-6 relative", collapsed && "px-3")}>
        {!collapsed ? (
          <>
            <h1 className="text-2xl font-bold text-primary">NextFleet</h1>
            <p className="text-sm text-muted-foreground">Fleet Management</p>
          </>
        ) : (
          <div className="text-2xl font-bold text-primary text-center">NF</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-7 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.title}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </TooltipProvider>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t space-y-3">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user?.name}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs mt-1",
                    (session?.user as User)?.role === "ADMIN" &&
                      "bg-red-500/10 text-red-700 border-red-300",
                    (session?.user as User)?.role === "SUPERVISOR" &&
                      "bg-blue-500/10 text-blue-700 border-blue-300",
                    (session?.user as User)?.role === "HR" &&
                      "bg-purple-500/10 text-purple-700 border-purple-300",
                    (session?.user as User)?.role === "OPERATOR" &&
                      "bg-green-500/10 text-green-700 border-green-300",
                    (session?.user as User)?.role === "EMPLOYEE" &&
                      "bg-gray-500/10 text-gray-700 border-gray-300"
                  )}
                >
                  {(session?.user as User)?.role
                    ? t(`roles.${(session?.user as User).role.toLowerCase()}`)
                    : t("roles.viewer")}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 px-3">
              <PushNotificationToggle />
              <NotificationCenter />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            >
              <LogOut className="h-4 w-4" />
              {t("auth.logout")}
            </Button>
          </>
        ) : (
          <TooltipProvider>
            <div className="space-y-2">
              <div className="flex gap-1 justify-center">
                <PushNotificationToggle />
                <NotificationCenter />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full"
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("auth.logout")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </aside>
  );
}
