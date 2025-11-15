"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle } from "@/lib/types";

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: VehicleInput) => void;
  isLoading?: boolean;
}

export function VehicleForm({
  vehicle,
  onSubmit,
  isLoading,
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          name: vehicle.name,
          type: vehicle.type,
          licensePlate: vehicle.licensePlate,
          status: vehicle.status,
          driverName: vehicle.driverName,
          mileage: vehicle.mileage,
          fuelConsumption: vehicle.fuelConsumption,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Vehicle Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Fleet Sedan Alpha"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Vehicle Type</Label>
        <Select
          onValueChange={(value) => setValue("type", value as any)}
          defaultValue={vehicle?.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEDAN">Sedan</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="TRUCK">Truck</SelectItem>
            <SelectItem value="VAN">Van</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="licensePlate">License Plate</Label>
        <Input
          id="licensePlate"
          {...register("licensePlate")}
          placeholder="ABC1234"
        />
        {errors.licensePlate && (
          <p className="text-sm text-destructive">
            {errors.licensePlate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) => setValue("status", value as any)}
          defaultValue={vehicle?.status || "ACTIVE"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driverName">Driver Name (Optional)</Label>
        <Input
          id="driverName"
          {...register("driverName")}
          placeholder="John Smith"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mileage">Mileage (km)</Label>
          <Input
            id="mileage"
            type="number"
            {...register("mileage")}
            placeholder="0"
          />
          {errors.mileage && (
            <p className="text-sm text-destructive">{errors.mileage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuelConsumption">Fuel Consumption (L/100km)</Label>
          <Input
            id="fuelConsumption"
            type="number"
            step="0.1"
            {...register("fuelConsumption")}
            placeholder="0"
          />
          {errors.fuelConsumption && (
            <p className="text-sm text-destructive">
              {errors.fuelConsumption.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : vehicle
            ? "Update Vehicle"
            : "Create Vehicle"}
        </Button>
      </div>
    </form>
  );
}
