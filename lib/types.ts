export type Role = "ADMIN" | "OPERATOR" | "EMPLOYEE" | "SUPERVISOR" | "HR";

export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export type VehicleType = "SEDAN" | "SUV" | "TRUCK" | "VAN";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  status: VehicleStatus;
  driverId?: string;
  driverName?: string;
  lastMaintenance?: Date | string;
  nextMaintenance?: Date | string;
  mileage: number;
  fuelConsumption: number;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  startDate: Date | string;
  endDate?: Date | string;
  distance: number;
  fuelUsed: number;
  destination: string;
  driverName: string;
  createdAt: Date | string;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  averageConsumption: number;
  upcomingMaintenance: number;
}

export interface MonthlyData {
  month: string;
  mileage: number;
  activeVehicles: number;
  inactiveVehicles: number;
}

export interface AnalyticsData {
  fuelConsumption: Array<{
    month: string;
    consumption: number;
  }>;
  utilizationRate: Array<{
    vehicle: string;
    rate: number;
  }>;
  driverPerformance: Array<{
    driver: string;
    score: number;
  }>;
}

export interface VehicleWithTrips extends Vehicle {
  trips: Trip[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
