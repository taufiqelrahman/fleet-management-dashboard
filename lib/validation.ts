import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const vehicleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["SEDAN", "SUV", "TRUCK", "VAN"], {
    required_error: "Please select a vehicle type",
  }),
  licensePlate: z
    .string()
    .min(5, "License plate must be at least 5 characters")
    .max(10, "License plate must be less than 10 characters")
    .toUpperCase(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).default("ACTIVE"),
  driverName: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  mileage: z.coerce.number().min(0, "Mileage must be positive").default(0),
  fuelConsumption: z.coerce
    .number()
    .min(0, "Fuel consumption must be positive")
    .default(0),
});

export const vehicleUpdateSchema = vehicleSchema.partial().extend({
  id: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
