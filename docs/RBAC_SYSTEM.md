# Role-Based Access Control (RBAC) System

## Overview

NextFleet implements a comprehensive role-based access control system with 5 distinct roles, each with specific permissions tailored to their responsibilities in fleet management operations.

## Roles

### 1. 👨‍💼 Admin

**Full System Administrator**

**Primary Responsibilities:**

- System configuration and maintenance
- User account management
- Complete oversight of all operations
- Settings and security management

**Access Level:** FULL ACCESS

- ✅ All vehicle and trip operations
- ✅ Complete attendance and timesheet management
- ✅ Schedule creation and modification
- ✅ Analytics and comprehensive reporting
- ✅ Payroll generation and review
- ✅ User management (create, edit, delete users)
- ✅ System settings and configuration

**Use Cases:**

- System setup and configuration
- Creating and managing user accounts
- Reviewing system-wide reports
- Emergency access to all data
- Audit and compliance checks

---

### 2. 🚗 Operator

**Fleet Operations Specialist**

**Primary Responsibilities:**

- Day-to-day vehicle management
- Trip logging and tracking
- Vehicle maintenance coordination
- Personal time tracking

**Access Level:** OPERATIONAL

- ✅ Create, view, and edit vehicles
- ✅ Create, view, and edit trips
- ✅ Own attendance (clock in/out)
- ✅ Own timesheet tracking
- ✅ View own schedule
- ✅ View analytics dashboard
- ✅ View own payroll information
- ❌ Cannot manage other users' data
- ❌ Cannot approve or modify others' records

**Use Cases:**

- Adding new vehicles to the fleet
- Logging daily trips
- Tracking maintenance schedules
- Recording personal work hours
- Checking vehicle availability

---

### 3. 👤 Employee

**Regular Staff Member**

**Primary Responsibilities:**

- Personal attendance tracking
- Work hours logging
- Schedule viewing
- Personal record management

**Access Level:** PERSONAL ONLY

- ✅ Clock in/out for attendance
- ✅ View attendance history (own)
- ✅ Start/stop timesheet activities
- ✅ View assigned schedules
- ✅ View own payroll information
- ❌ Cannot access vehicle/trip data
- ❌ Cannot view other employees' data
- ❌ Cannot approve or manage schedules

**Use Cases:**

- Daily clock in/out
- Logging work activities
- Checking assigned shifts
- Reviewing personal attendance record
- Viewing pay information

---

### 4. 👔 Supervisor

**Team Lead / Manager**

**Primary Responsibilities:**

- Team oversight and monitoring
- Attendance and timesheet approval
- Schedule management for team
- Performance reporting

**Access Level:** TEAM MANAGEMENT

- ✅ View all vehicles and trips (read-only)
- ✅ View and approve team attendance
- ✅ View and approve team timesheets
- ✅ Create and manage team schedules
- ✅ Access analytics and reports
- ✅ Export team data
- ✅ Own attendance and timesheet
- ✅ View own payroll
- ❌ Cannot edit vehicles/trips
- ❌ Cannot manage payroll
- ❌ Cannot manage user accounts

**Use Cases:**

- Reviewing team attendance
- Approving overtime requests
- Creating weekly shift schedules
- Monitoring team performance
- Generating team reports
- Resolving attendance disputes

---

### 5. 👨‍💼 HR (Human Resources)

**HR Manager / Payroll Administrator**

**Primary Responsibilities:**

- Employee data management
- Attendance oversight
- Payroll processing
- Leave management
- HR reporting

**Access Level:** HR OPERATIONS

- ✅ View and manage all employee attendance
- ✅ View and manage all timesheets
- ✅ Create and manage all schedules
- ✅ Generate payroll reports
- ✅ Process payroll
- ✅ View all employee data
- ✅ Export HR reports
- ✅ Approve leave requests
- ✅ Own attendance and timesheet
- ❌ Cannot manage vehicles/trips
- ❌ Cannot create user accounts
- ❌ Cannot access system settings

**Use Cases:**

- Processing monthly payroll
- Managing employee leave
- Generating attendance reports
- Handling HR inquiries
- Compliance reporting
- Overtime calculation
- Benefits administration

---

## Permission System

### Permission Categories

#### 1. Vehicle Management

- `VIEW_VEHICLES` - View vehicle list and details
- `CREATE_VEHICLE` - Add new vehicles
- `EDIT_VEHICLE` - Modify vehicle information
- `DELETE_VEHICLE` - Remove vehicles

#### 2. Trip Management

- `VIEW_TRIPS` - View trip records
- `CREATE_TRIP` - Log new trips
- `EDIT_TRIP` - Modify trip details
- `DELETE_TRIP` - Remove trip records

#### 3. Attendance Management

- `VIEW_OWN_ATTENDANCE` - View personal attendance
- `VIEW_ALL_ATTENDANCE` - View team/company attendance
- `MANAGE_OWN_ATTENDANCE` - Clock in/out
- `MANAGE_ALL_ATTENDANCE` - Modify any attendance record
- `APPROVE_ATTENDANCE` - Approve attendance requests

#### 4. Timesheet Management

- `VIEW_OWN_TIMESHEET` - View personal timesheets
- `VIEW_ALL_TIMESHEET` - View team/company timesheets
- `MANAGE_OWN_TIMESHEET` - Start/stop own activities
- `MANAGE_ALL_TIMESHEET` - Modify any timesheet
- `APPROVE_TIMESHEET` - Approve timesheet entries

#### 5. Schedule Management

- `VIEW_OWN_SCHEDULE` - View assigned shifts
- `VIEW_ALL_SCHEDULE` - View all schedules
- `MANAGE_OWN_SCHEDULE` - Request shift changes
- `MANAGE_ALL_SCHEDULE` - Create/modify all schedules

#### 6. Analytics & Reports

- `VIEW_ANALYTICS` - Access analytics dashboard
- `VIEW_REPORTS` - Generate and view reports
- `EXPORT_DATA` - Export data to CSV/PDF

#### 7. Payroll

- `VIEW_OWN_PAYROLL` - View personal payroll
- `VIEW_ALL_PAYROLL` - View all payroll data
- `GENERATE_PAYROLL` - Process payroll

#### 8. User Management

- `VIEW_USERS` - View user list
- `MANAGE_USERS` - Create/edit/delete users

#### 9. Settings

- `MANAGE_SETTINGS` - System configuration

---

## Implementation

### Backend (Server Actions)

```typescript
import { Role, Permission, hasPermission } from "@/lib/permissions";

export async function updateVehicle(id: string, data: VehicleData) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role as Role;

  // Check permission
  if (!hasPermission(userRole, Permission.EDIT_VEHICLE)) {
    return { success: false, message: "Insufficient permissions" };
  }

  // Proceed with update...
}
```

### Frontend (UI Components)

```typescript
import { useSession } from "next-auth/react";
import { Role, hasPermission, Permission } from "@/lib/permissions";

function VehicleActions({ vehicleId }: { vehicleId: string }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role;

  const canEdit = hasPermission(userRole, Permission.EDIT_VEHICLE);
  const canDelete = hasPermission(userRole, Permission.DELETE_VEHICLE);

  return (
    <>
      {canEdit && <EditButton vehicleId={vehicleId} />}
      {canDelete && <DeleteButton vehicleId={vehicleId} />}
    </>
  );
}
```

---

## Security Best Practices

### 1. Always Verify on Server

```typescript
// ❌ Bad - Client-side only check
if (hasPermission(role, permission)) {
  updateData();
}

// ✅ Good - Server-side verification
export async function updateData() {
  const session = await getServerSession();
  if (!hasPermission(session.user.role, permission)) {
    throw new Error("Unauthorized");
  }
  // proceed...
}
```

### 2. Principle of Least Privilege

- Users only get permissions they need
- Default to no access, explicitly grant permissions
- Regular audit of role permissions

### 3. Defense in Depth

- UI-level checks (hide unauthorized buttons)
- API-level checks (validate permissions)
- Database-level checks (row-level security)

---

## Testing Roles

### Quick Test Suite

1. **Admin Test**: Login as admin@nextfleet.com

   - ✓ Can access all pages
   - ✓ Can modify all records
   - ✓ Can manage users

2. **Operator Test**: Login as operator@nextfleet.com

   - ✓ Can manage vehicles/trips
   - ✓ Can track own time
   - ✗ Cannot access user management

3. **Employee Test**: Login as employee@nextfleet.com

   - ✓ Can clock in/out
   - ✓ Can view own schedule
   - ✗ Cannot access vehicles page

4. **Supervisor Test**: Login as supervisor@nextfleet.com

   - ✓ Can view team data
   - ✓ Can approve timesheets
   - ✗ Cannot edit vehicles

5. **HR Test**: Login as hr@nextfleet.com
   - ✓ Can process payroll
   - ✓ Can manage all attendance
   - ✗ Cannot manage vehicles

---

## Extending the System

### Adding a New Permission

1. Add to Permission enum:

```typescript
export enum Permission {
  // ... existing
  NEW_PERMISSION = "NEW_PERMISSION",
}
```

2. Assign to roles:

```typescript
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [...existing, Permission.NEW_PERMISSION],
  // ... other roles
};
```

3. Use in code:

```typescript
if (hasPermission(userRole, Permission.NEW_PERMISSION)) {
  // execute action
}
```

### Creating a New Role

1. Add to Prisma schema:

```prisma
enum Role {
  // ... existing
  NEW_ROLE
}
```

2. Run migration:

```bash
pnpm prisma migrate dev --name add_new_role
```

3. Define permissions:

```typescript
[Role.NEW_ROLE]: [
  Permission.PERMISSION_1,
  Permission.PERMISSION_2,
]
```

---

## Troubleshooting

### User Cannot Access Feature

1. Check user's role in database
2. Verify permission is assigned to role
3. Confirm server-side check exists
4. Check session is valid

### Permission Denied Error

```typescript
// Debug permission check
console.log("User role:", session?.user?.role);
console.log("Required permission:", Permission.EDIT_VEHICLE);
console.log(
  "Has permission:",
  hasPermission(userRole, Permission.EDIT_VEHICLE)
);
console.log("Role permissions:", getRolePermissions(userRole));
```

---

## Summary

NextFleet's RBAC system provides:

- ✅ Clear separation of duties
- ✅ Granular access control
- ✅ Scalable permission system
- ✅ Type-safe implementation
- ✅ Easy to extend and maintain

Each role is designed around real-world fleet management scenarios, ensuring users have appropriate access to perform their duties efficiently while maintaining security and data integrity.
