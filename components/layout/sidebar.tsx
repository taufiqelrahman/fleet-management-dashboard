"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Car, BarChart3, LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { useTranslations, useLocale } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session } = useSession();

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
  ];

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r bg-card",
        !mobile && "hidden md:flex"
      )}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">NextFleet</h1>
        <p className="text-sm text-muted-foreground">Fleet Management</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
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
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {(session?.user as User)?.role || "User"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          >
            <LogOut className="h-4 w-4" />
            {t("auth.logout")}
          </Button>
          <LocaleSwitcher />
        </div>
      </div>
    </aside>
  );
}
