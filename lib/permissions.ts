// Role-based permissions system

export enum Role {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  EMPLOYEE = "EMPLOYEE",
  SUPERVISOR = "SUPERVISOR",
  HR = "HR",
}

export enum Permission {
  // Vehicle Management
  VIEW_VEHICLES = "VIEW_VEHICLES",
  CREATE_VEHICLE = "CREATE_VEHICLE",
  EDIT_VEHICLE = "EDIT_VEHICLE",
  DELETE_VEHICLE = "DELETE_VEHICLE",

  // Trip Management
  VIEW_TRIPS = "VIEW_TRIPS",
  CREATE_TRIP = "CREATE_TRIP",
  EDIT_TRIP = "EDIT_TRIP",
  DELETE_TRIP = "DELETE_TRIP",

  // Attendance Management
  VIEW_OWN_ATTENDANCE = "VIEW_OWN_ATTENDANCE",
  VIEW_ALL_ATTENDANCE = "VIEW_ALL_ATTENDANCE",
  MANAGE_OWN_ATTENDANCE = "MANAGE_OWN_ATTENDANCE",
  MANAGE_ALL_ATTENDANCE = "MANAGE_ALL_ATTENDANCE",
  APPROVE_ATTENDANCE = "APPROVE_ATTENDANCE",

  // Timesheet Management
  VIEW_OWN_TIMESHEET = "VIEW_OWN_TIMESHEET",
  VIEW_ALL_TIMESHEET = "VIEW_ALL_TIMESHEET",
  MANAGE_OWN_TIMESHEET = "MANAGE_OWN_TIMESHEET",
  MANAGE_ALL_TIMESHEET = "MANAGE_ALL_TIMESHEET",
  APPROVE_TIMESHEET = "APPROVE_TIMESHEET",

  // Schedule Management
  VIEW_OWN_SCHEDULE = "VIEW_OWN_SCHEDULE",
  VIEW_ALL_SCHEDULE = "VIEW_ALL_SCHEDULE",
  MANAGE_OWN_SCHEDULE = "MANAGE_OWN_SCHEDULE",
  MANAGE_ALL_SCHEDULE = "MANAGE_ALL_SCHEDULE",

  // Analytics & Reports
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  VIEW_REPORTS = "VIEW_REPORTS",
  EXPORT_DATA = "EXPORT_DATA",

  // Payroll
  VIEW_OWN_PAYROLL = "VIEW_OWN_PAYROLL",
  VIEW_ALL_PAYROLL = "VIEW_ALL_PAYROLL",
  GENERATE_PAYROLL = "GENERATE_PAYROLL",

  // User Management
  VIEW_USERS = "VIEW_USERS",
  MANAGE_USERS = "MANAGE_USERS",

  // Settings
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
}

// Role-Permission mapping
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // Full access to everything
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLE,
    Permission.EDIT_VEHICLE,
    Permission.DELETE_VEHICLE,
    Permission.VIEW_TRIPS,
    Permission.CREATE_TRIP,
    Permission.EDIT_TRIP,
    Permission.DELETE_TRIP,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.MANAGE_OWN_ATTENDANCE,
    Permission.MANAGE_ALL_ATTENDANCE,
    Permission.APPROVE_ATTENDANCE,
    Permission.VIEW_OWN_TIMESHEET,
    Permission.VIEW_ALL_TIMESHEET,
    Permission.MANAGE_OWN_TIMESHEET,
    Permission.MANAGE_ALL_TIMESHEET,
    Permission.APPROVE_TIMESHEET,
    Permission.VIEW_OWN_SCHEDULE,
    Permission.VIEW_ALL_SCHEDULE,
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.MANAGE_ALL_SCHEDULE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_ALL_PAYROLL,
    Permission.GENERATE_PAYROLL,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SETTINGS,
  ],

  [Role.OPERATOR]: [
    // Vehicle and trip operations
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLE,
    Permission.EDIT_VEHICLE,
    Permission.VIEW_TRIPS,
    Permission.CREATE_TRIP,
    Permission.EDIT_TRIP,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.MANAGE_OWN_ATTENDANCE,
    Permission.VIEW_OWN_TIMESHEET,
    Permission.MANAGE_OWN_TIMESHEET,
    Permission.VIEW_OWN_SCHEDULE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_OWN_PAYROLL,
  ],

  [Role.EMPLOYEE]: [
    // Basic employee - own data only
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.MANAGE_OWN_ATTENDANCE,
    Permission.VIEW_OWN_TIMESHEET,
    Permission.MANAGE_OWN_TIMESHEET,
    Permission.VIEW_OWN_SCHEDULE,
    Permission.VIEW_OWN_PAYROLL,
  ],

  [Role.SUPERVISOR]: [
    // Team management
    Permission.VIEW_VEHICLES,
    Permission.VIEW_TRIPS,
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.MANAGE_OWN_ATTENDANCE,
    Permission.APPROVE_ATTENDANCE,
    Permission.VIEW_OWN_TIMESHEET,
    Permission.VIEW_ALL_TIMESHEET,
    Permission.MANAGE_OWN_TIMESHEET,
    Permission.APPROVE_TIMESHEET,
    Permission.VIEW_OWN_SCHEDULE,
    Permission.VIEW_ALL_SCHEDULE,
    Permission.MANAGE_ALL_SCHEDULE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_OWN_PAYROLL,
  ],

  [Role.HR]: [
    // HR and payroll management
    Permission.VIEW_OWN_ATTENDANCE,
    Permission.VIEW_ALL_ATTENDANCE,
    Permission.MANAGE_OWN_ATTENDANCE,
    Permission.MANAGE_ALL_ATTENDANCE,
    Permission.APPROVE_ATTENDANCE,
    Permission.VIEW_OWN_TIMESHEET,
    Permission.VIEW_ALL_TIMESHEET,
    Permission.MANAGE_OWN_TIMESHEET,
    Permission.MANAGE_ALL_TIMESHEET,
    Permission.APPROVE_TIMESHEET,
    Permission.VIEW_OWN_SCHEDULE,
    Permission.VIEW_ALL_SCHEDULE,
    Permission.MANAGE_ALL_SCHEDULE,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_OWN_PAYROLL,
    Permission.VIEW_ALL_PAYROLL,
    Permission.GENERATE_PAYROLL,
    Permission.VIEW_USERS,
  ],
};

// Helper functions
export function hasPermission(userRole: Role, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  userRole: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: Role,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] || [];
}

export function canAccessRoute(userRole: Role, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": [],
    "/dashboard/vehicles": [Permission.VIEW_VEHICLES],
    "/dashboard/analytics": [Permission.VIEW_ANALYTICS],
    "/dashboard/attendance": [Permission.VIEW_OWN_ATTENDANCE],
    "/dashboard/timesheets": [Permission.VIEW_OWN_TIMESHEET],
    "/dashboard/schedules": [Permission.VIEW_OWN_SCHEDULE],
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // Public route
  }

  return hasAnyPermission(userRole, requiredPermissions);
}

// Role descriptions for UI
export const roleDescriptions: Record<Role, string> = {
  [Role.ADMIN]: "Full system access and configuration",
  [Role.OPERATOR]: "Vehicle and trip management",
  [Role.EMPLOYEE]: "Personal attendance and timesheet tracking",
  [Role.SUPERVISOR]: "Team oversight and approval authority",
  [Role.HR]: "Employee management and payroll administration",
};

// Role display names
export const roleDisplayNames: Record<Role, string> = {
  [Role.ADMIN]: "Administrator",
  [Role.OPERATOR]: "Operator",
  [Role.EMPLOYEE]: "Employee",
  [Role.SUPERVISOR]: "Supervisor",
  [Role.HR]: "HR Manager",
};
