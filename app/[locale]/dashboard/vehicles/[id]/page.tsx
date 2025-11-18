"use client";

import { use } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVehicle } from "@/hooks/useVehicles";
import { ArrowLeft, Car, User, Gauge, Calendar } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useVehicle(id);

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-destructive">Failed to load vehicle details</div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading...</div>
      </DashboardLayout>
    );
  }

  const vehicle = data;

  if (!vehicle) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Vehicle not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <Link href="/dashboard/vehicles">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vehicles
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
          <p className="text-muted-foreground">
            Vehicle details and trip history
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Type</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicle.type}</div>
              <p className="text-xs text-muted-foreground">
                {vehicle.licensePlate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Driver</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vehicle.driverName || "Unassigned"}
              </div>
              <p className="text-xs text-muted-foreground">Current driver</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mileage</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(vehicle.mileage)} km
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(vehicle.fuelConsumption, 1)} L/100km
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {vehicle.nextMaintenance
                  ? formatDate(vehicle.nextMaintenance)
                  : "Not scheduled"}
              </div>
              <p className="text-xs text-muted-foreground">Next scheduled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle.trips && vehicle.trips.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Fuel Used</TableHead>
                    <TableHead>Driver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicle.trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{formatDate(trip.startDate)}</TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>{formatNumber(trip.distance)} km</TableCell>
                      <TableCell>{formatNumber(trip.fuelUsed, 1)} L</TableCell>
                      <TableCell>{trip.driverName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No trips recorded
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
