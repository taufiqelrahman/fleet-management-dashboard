import { Prisma } from "@prisma/client";

// Attendance Types
export type Attendance = {
  id: string;
  userId: string;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  status: AttendanceStatus;
  location: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AttendanceWithUser = Prisma.AttendanceGetPayload<{
  include: { user: true };
}>;

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  HALF_DAY = "HALF_DAY",
  ON_LEAVE = "ON_LEAVE",
}

export type CreateAttendanceInput = {
  userId: string;
  clockIn: Date;
  location?: string;
  notes?: string;
};

export type UpdateAttendanceInput = {
  clockOut?: Date;
  status?: AttendanceStatus;
  notes?: string;
};

// Timesheet Types
export type Timesheet = {
  id: string;
  userId: string;
  vehicleId: string | null;
  activityType: ActivityType;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  description: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TimesheetWithRelations = Prisma.TimesheetGetPayload<{
  include: { user: true; vehicle: true };
}>;

export enum ActivityType {
  DRIVING = "DRIVING",
  MAINTENANCE = "MAINTENANCE",
  INSPECTION = "INSPECTION",
  FUELING = "FUELING",
  CLEANING = "CLEANING",
  PARKING = "PARKING",
  OTHER = "OTHER",
}

export type CreateTimesheetInput = {
  userId: string;
  vehicleId?: string;
  activityType: ActivityType;
  startTime: Date;
  description?: string;
  location?: string;
};

export type UpdateTimesheetInput = {
  endTime?: Date;
  duration?: number;
  description?: string;
};

// Shift Types
export type Shift = {
  id: string;
  userId: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  status: ShiftStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ShiftWithUser = Prisma.ShiftGetPayload<{
  include: { user: true };
}>;

export enum ShiftType {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  NIGHT = "NIGHT",
  FLEXIBLE = "FLEXIBLE",
}

export enum ShiftStatus {
  SCHEDULED = "SCHEDULED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type CreateShiftInput = {
  userId: string;
  shiftType: ShiftType;
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export type UpdateShiftInput = {
  shiftType?: ShiftType;
  startTime?: Date;
  endTime?: Date;
  status?: ShiftStatus;
  notes?: string;
};

// Stats Types
export type AttendanceStats = {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendanceRate: number;
};

export type TimesheetStats = {
  totalHours: number;
  totalActivities: number;
  byActivityType: Record<ActivityType, number>;
};

export type ShiftStats = {
  totalScheduled: number;
  totalCompleted: number;
  totalOngoing: number;
  completionRate: number;
};
