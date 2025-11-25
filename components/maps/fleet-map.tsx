"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { Truck, Car, Package } from "lucide-react";

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

type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";
type VehicleType = "SEDAN" | "SUV" | "TRUCK" | "VAN";

interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  status: VehicleStatus;
  driverName: string | null;
  latitude: number | null;
  longitude: number | null;
  mileage: number;
}

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">{t("map.loading")}</p>
      </Card>
    );
  }

  const validVehicles = vehicles.filter(
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
    <Card className="w-full h-[500px] overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
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
                    <span className="font-medium">{t("vehicles.driver")}:</span>{" "}
                    {vehicle.driverName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">
                      {t("vehicles.mileage")}:
                    </span>{" "}
                    {vehicle.mileage.toLocaleString()} km
                  </p>
                  <div className="pt-1">{getStatusBadge(vehicle.status)}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}
