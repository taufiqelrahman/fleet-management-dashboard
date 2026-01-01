"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  Trash2,
  Shield,
  MapPin,
  Calendar,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Device {
  id: string;
  name: string;
  deviceType: string;
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
  ipAddress?: string;
  location?: string;
  lastLoginAt?: string;
  lastActive: string;
  isActive: boolean;
  isTrusted: boolean;
}

export default function DeviceManager() {
  const t = useTranslations("settings.devices");
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast({
        title: t("error"),
        description: t("fetchError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveDevice = async (deviceId: string) => {
    if (!confirm(t("removeConfirm"))) return;

    setRemovingId(deviceId);
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove device");

      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      toast({
        title: t("success"),
        description: t("removeSuccess"),
      });
    } catch (error) {
      console.error("Error removing device:", error);
      toast({
        title: t("error"),
        description: t("removeError"),
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleToggleTrust = async (device: Device) => {
    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrusted: !device.isTrusted }),
      });

      if (!response.ok) throw new Error("Failed to update device");

      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, isTrusted: !d.isTrusted } : d
        )
      );

      toast({
        title: t("success"),
        description: device.isTrusted ? t("untrustSuccess") : t("trustSuccess"),
      });
    } catch (error) {
      console.error("Error updating device:", error);
      toast({
        title: t("error"),
        description: t("updateError"),
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-5 w-5" />;
      case "tablet":
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">{t("noDevices")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {devices.map((device) => (
        <Card key={device.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getDeviceIcon(device.deviceType)}
                <div>
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Chrome className="h-3 w-3" />
                    {device.browser}
                    {device.browserVersion &&
                      ` ${device.browserVersion}`} • {device.os}
                    {device.osVersion && ` ${device.osVersion}`}
                  </CardDescription>
                </div>
              </div>
              {device.isTrusted && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {t("trusted")}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {device.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{device.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("lastActive")}:{" "}
                  {format(new Date(device.lastActive), "PPp")}
                </span>
              </div>
              {device.lastLoginAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t("lastLogin")}:{" "}
                    {format(new Date(device.lastLoginAt), "PPp")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleTrust(device)}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                {device.isTrusted ? t("untrust") : t("trust")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveDevice(device.id)}
                disabled={removingId === device.id}
              >
                {removingId === device.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
