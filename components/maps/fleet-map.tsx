"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Truck, Car, Package, Filter, X } from "lucide-react";
import type { Vehicle, VehicleStatus, VehicleType } from "@/lib/types";

// Fix for default marker icon in Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons for different vehicle statuses
const createCustomIcon = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: "#22c55e", // green
    MAINTENANCE: "#ef4444", // red
    INACTIVE: "#94a3b8", // gray
  };

  const color = colors[status] || "#3b82f6";

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface FleetMapProps {
  vehicles: Vehicle[];
}

// Component to auto-fit bounds
function FitBounds({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();

  useEffect(() => {
    if (vehicles.length > 0) {
      const validVehicles = vehicles.filter(
        (v) => v.latitude !== null && v.longitude !== null
      );

      if (validVehicles.length > 0) {
        const bounds = L.latLngBounds(
          validVehicles.map((v) => [v.latitude!, v.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [vehicles, map]);

  return null;
}

export function FleetMap({ vehicles }: FleetMapProps) {
  const t = useTranslations();
  const [isMounted, setIsMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter vehicles based on selected filters
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesStatus =
      statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    statusFilter !== "all" || typeFilter !== "all" || searchQuery !== "";

  if (!isMounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("map.fleetLocation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
            <p className="text-muted-foreground">{t("map.loading")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validVehicles = filteredVehicles.filter(
    (v) => v.latitude !== null && v.longitude !== null
  );

  // Default center (Jakarta)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  const getStatusBadge = (status: VehicleStatus) => {
    const colors: Record<VehicleStatus, string> = {
      ACTIVE: "bg-green-500",
      MAINTENANCE: "bg-red-500",
      INACTIVE: "bg-gray-500",
    };
    return (
      <Badge className={colors[status]}>
        {t(`vehicles.status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case "TRUCK":
        return <Truck className="h-4 w-4" />;
      case "VAN":
        return <Package className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          {t("map.fleetLocation")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder={t("map.searchVehicle")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("map.filterByStatus")} />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="all">{t("map.allStatus")}</SelectItem>
              <SelectItem value="ACTIVE">
                {t("vehicles.status.active")}
              </SelectItem>
              <SelectItem value="MAINTENANCE">
                {t("vehicles.status.maintenance")}
              </SelectItem>
              <SelectItem value="INACTIVE">
                {t("vehicles.status.inactive")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("map.filterByType")} />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="all">{t("map.allTypes")}</SelectItem>
              <SelectItem value="SEDAN">{t("vehicles.type.sedan")}</SelectItem>
              <SelectItem value="SUV">{t("vehicles.type.suv")}</SelectItem>
              <SelectItem value="TRUCK">{t("vehicles.type.truck")}</SelectItem>
              <SelectItem value="VAN">{t("vehicles.type.van")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter summary and clear button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("map.showing")} {validVehicles.length} {t("map.of")}{" "}
              {vehicles.length} {t("map.vehicles")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8"
            >
              <X className="h-3 w-3 mr-1" />
              {t("map.clearFilters")}
            </Button>
          </div>
        )}

        {/* Map */}
        <div className="h-[500px] overflow-hidden rounded-md relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds vehicles={validVehicles} />
            {validVehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={[vehicle.latitude!, vehicle.longitude!]}
                icon={createCustomIcon(vehicle.status)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                      {getVehicleIcon(vehicle.type)}
                      <h3 className="font-semibold">{vehicle.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">
                          {t("vehicles.licensePlate")}:
                        </span>{" "}
                        {vehicle.licensePlate}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("vehicles.driver")}:
                        </span>{" "}
                        {vehicle.driverName || "-"}
                      </p>
                      <p>
                        <span className="font-medium">
                          {t("vehicles.mileage")}:
                        </span>{" "}
                        {vehicle.mileage.toLocaleString()} km
                      </p>
                      <div className="pt-1">
                        {getStatusBadge(vehicle.status)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
