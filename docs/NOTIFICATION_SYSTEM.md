# Notification System

## Overview

Real-time notification system that keeps users informed about important events within the fleet management system. Built with TanStack Query for real-time polling and Prisma for data persistence on Next.js 16.

**Technology Stack:**

- Next.js 16 (App Router) with Server Actions
- TanStack Query v5 for state management & polling
- Prisma 6 for database operations
- PostgreSQL (Neon) for data storage
- ShadCN/UI components (Bell, Badge, DropdownMenu, ScrollArea)
- date-fns for timestamp formatting

## Features

### Notification Center

- **Bell icon** with unread badge counter in navbar/sidebar
- **Dropdown list** with scrollable notification history (last 20 notifications)
- **Real-time updates** via 30-second polling interval
- **Mark as read** (individual notifications or bulk "Mark all as read")
- **Delete notifications** with confirmation
- **Relative timestamps** (e.g., "2 minutes ago") using date-fns
- **Color-coded icons** based on notification type (emoji indicators)

### Notification Types

| Type                    | Icon | Description                           | Triggered By                                         |
| ----------------------- | ---- | ------------------------------------- | ---------------------------------------------------- |
| `CLOCK_IN`              | ⏰   | Clock-in confirmation with timestamp  | User clocks in via attendance system                 |
| `CLOCK_OUT`             | 🏁   | Clock-out confirmation with duration  | User clocks out via attendance system                |
| `VEHICLE_STATUS_CHANGE` | 🚗   | Vehicle status changed to maintenance | Admin/Operator updates vehicle status to MAINTENANCE |
| `MAINTENANCE_REMINDER`  | 🔧   | Upcoming maintenance alert            | (Future: Cron job checks nextMaintenance < 7 days)   |
| `SHIFT_REMINDER`        | 📅   | Shift starting soon                   | (Future: Notification 1 hour before shift start)     |
| `SYSTEM`                | 🔔   | General system notification           | Manual system announcements                          |

### Multi-language Support

- Full translation support (EN/ID/AR)
- Notification content adapts to user's selected language
- RTL-aware notification layout for Arabic

## Architecture

### Database Schema

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId, isRead, createdAt])
}

enum NotificationType {
  MAINTENANCE_REMINDER
  CLOCK_IN
  CLOCK_OUT
  VEHICLE_STATUS_CHANGE
  SHIFT_REMINDER
  SYSTEM
}
```

### Server Actions (`actions/notifications.ts`)

```typescript
// Get user notifications (latest first)
getNotifications(limit = 20): Promise<ActionResponse<Notification[]>>

// Get unread notification count
getUnreadCount(): Promise<ActionResponse<number>>

// Mark single notification as read
markAsRead(notificationId: string): Promise<ActionResponse>

// Mark all user notifications as read
markAllAsRead(): Promise<ActionResponse>

// Delete notification (with ownership check)
deleteNotification(notificationId: string): Promise<ActionResponse>

// Create notification (internal use only)
createNotification(data: NotificationData): Promise<ActionResponse>
```

### React Hook (`hooks/useNotifications.ts`)

```typescript
const {
  notifications, // Array of notification objects
  unreadCount, // Number of unread notifications
  isLoading, // Loading state
  markAsRead, // Function to mark notification as read
  markAllAsRead, // Function to mark all as read
  deleteNotification, // Function to delete notification
} = useNotifications();
```

**Features:**

- TanStack Query integration for caching
- Auto-polling every 30 seconds for real-time updates
- Optimistic UI updates with automatic rollback on error
- Cache invalidation after mutations

### UI Component (`components/layout/notification-center.tsx`)

**Location:**

- Desktop: Sidebar footer (next to locale switcher)
- Mobile: Navbar header (right side)

**Structure:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger>
    <Bell icon with Badge counter>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <Header with "Mark all as read" button>
    <ScrollArea with notifications list>
      {notifications.map(notification => (
        <NotificationItem
          icon={emoji based on type}
          title={notification.title}
          message={notification.message}
          timestamp={relative time}
          actions={mark as read, delete}
        />
      ))}
    </ScrollArea>
  </DropdownMenuContent>
</DropdownMenu>
```

## Implementation Details

### Current Auto-triggered Notifications

#### 1. Clock In (`actions/attendance.ts`)

```typescript
// After successful clock-in
await prisma.notification.create({
  data: {
    userId: authResult.user.id,
    type: "CLOCK_IN",
    title: "Clock In Successful",
    message: `You clocked in at ${now.toLocaleTimeString()}${
      status === "LATE" ? " (Late)" : ""
    }`,
  },
});
```

#### 2. Clock Out (`actions/attendance.ts`)

```typescript
// After successful clock-out
await prisma.notification.create({
  data: {
    userId: authResult.user.id,
    type: "CLOCK_OUT",
    title: "Clock Out Successful",
    message: `You clocked out at ${new Date().toLocaleTimeString()}`,
  },
});
```

#### 3. Vehicle Status Change (`actions/vehicles.ts`)

```typescript
// When vehicle status changes to MAINTENANCE
if (oldVehicle?.status !== "MAINTENANCE" && updates.status === "MAINTENANCE") {
  const usersToNotify = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "OPERATOR"] } },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: usersToNotify.map((user) => ({
      userId: user.id,
      type: "VEHICLE_STATUS_CHANGE",
      title: "Vehicle Status Changed",
      message: `${updatedVehicle.name} (${updatedVehicle.licensePlate}) is now in maintenance`,
    })),
  });
}
```

## Translation Keys

### English (`messages/en.json`)

```json
"notifications": {
  "title": "Notifications",
  "markAllRead": "Mark all as read",
  "noNotifications": "No notifications",
  "maintenanceReminder": "Maintenance Reminder",
  "clockIn": "Clock In",
  "clockOut": "Clock Out",
  "vehicleStatusChange": "Vehicle Status Changed",
  "shiftReminder": "Shift Reminder",
  "system": "System Notification"
}
```

### Indonesian (`messages/id.json`)

```json
"notifications": {
  "title": "Notifikasi",
  "markAllRead": "Tandai semua dibaca",
  "noNotifications": "Tidak ada notifikasi",
  "maintenanceReminder": "Pengingat Perawatan",
  "clockIn": "Masuk",
  "clockOut": "Keluar",
  "vehicleStatusChange": "Status Kendaraan Berubah",
  "shiftReminder": "Pengingat Shift",
  "system": "Notifikasi Sistem"
}
```

### Arabic (`messages/ar.json`)

```json
"notifications": {
  "title": "الإشعارات",
  "markAllRead": "تحديد الكل كمقروء",
  "noNotifications": "لا توجد إشعارات",
  "maintenanceReminder": "تذكير صيانة",
  "clockIn": "تسجيل الدخول",
  "clockOut": "تسجيل الخروج",
  "vehicleStatusChange": "تغيير حالة المركبة",
  "shiftReminder": "تذكير الوردية",
  "system": "إشعار النظام"
}
```

## Usage Examples

### Creating Manual Notifications

```typescript
import { createNotification } from "@/actions/notifications";

// Send system announcement to all users
const users = await prisma.user.findMany({ select: { id: true } });

for (const user of users) {
  await createNotification({
    userId: user.id,
    type: "SYSTEM",
    title: "System Maintenance",
    message:
      "The system will be under maintenance on Dec 20, 2025 from 2-4 AM.",
  });
}
```

### Checking Notifications in Component

```typescript
"use client";

import { useNotifications } from "@/hooks/useNotifications";

export function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map((notif) => (
        <div key={notif.id} onClick={() => markAsRead(notif.id)}>
          {notif.title}: {notif.message}
        </div>
      ))}
    </div>
  );
}
```

## Future Enhancements

### 1. Maintenance Reminders (Cron Job)

```typescript
// app/api/cron/maintenance-reminders.ts
export async function GET() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      nextMaintenance: {
        lte: sevenDaysFromNow,
        gte: new Date(),
      },
    },
  });

  for (const vehicle of vehicles) {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "MAINTENANCE_REMINDER",
        title: "Upcoming Maintenance",
        message: `${vehicle.name} (${
          vehicle.licensePlate
        }) maintenance due on ${vehicle.nextMaintenance.toLocaleDateString()}`,
      })),
    });
  }

  return Response.json({ success: true });
}
```

### 2. Shift Reminders

- Check shifts starting in the next hour
- Send reminder to assigned users
- Run every 15 minutes via cron

### 3. Push Notifications (Web Push API)

- Browser notifications even when tab is closed
- Requires service worker registration
- User opt-in for notifications

### 4. Email Notifications

- Critical notifications sent via email
- Configurable user preferences
- Integration with email service (SendGrid/AWS SES)

### 5. Sound Alerts

- Play sound for new critical notifications
- Configurable per notification type
- User preference to enable/disable

### 6. Notification Preferences

- User settings page to configure:
  - Which notification types to receive
  - Email vs in-app notifications
  - Sound alerts on/off
  - Notification frequency (instant, digest, off)

## Performance Considerations

### Polling Strategy

- **Interval**: 30 seconds (configurable in `useNotifications.ts`)
- **Stale Time**: 10 seconds (data considered fresh for 10s)
- **Impact**: Minimal server load for typical user counts (<100 users)

### Database Optimization

- **Index**: `@@index([userId, isRead, createdAt])` for fast queries
- **Limit**: Only fetch last 20 notifications to reduce payload
- **Cascade Delete**: Notifications auto-deleted when user is deleted

### Alternative: WebSocket (For Future)

For real-time push notifications without polling:

```typescript
// Use Socket.io or native WebSocket
io.on("connection", (socket) => {
  socket.on("notification:new", (data) => {
    // Push notification to specific user
    socket.to(`user:${data.userId}`).emit("notification", data);
  });
});
```

## Testing

### Manual Testing Checklist

- [ ] Clock in → Notification appears
- [ ] Clock out → Notification appears
- [ ] Change vehicle to maintenance → Admin/Operator receives notification
- [ ] Mark as read → Badge counter decreases
- [ ] Mark all as read → All notifications marked, badge = 0
- [ ] Delete notification → Notification removed from list
- [ ] Language switch → Notification types translated
- [ ] Mobile view → Bell icon in navbar
- [ ] Desktop view → Bell icon in sidebar

### Automated Tests (Future)

```typescript
// __tests__/notifications.test.ts
describe("Notification System", () => {
  it("should create notification on clock-in", async () => {
    await clockIn({ userId: "user1" });
    const notifications = await getNotifications("user1");
    expect(notifications[0].type).toBe("CLOCK_IN");
  });

  it("should send notification to admins on vehicle status change", async () => {
    await updateVehicle("vehicle1", { status: "MAINTENANCE" });
    const adminNotifications = await getNotifications("admin1");
    expect(adminNotifications[0].type).toBe("VEHICLE_STATUS_CHANGE");
  });
});
```

## Troubleshooting

### Notifications not appearing

1. Check TypeScript server restarted after Prisma regeneration
2. Verify Prisma client has `notification` model: `pnpm prisma generate`
3. Check database has Notification table: `pnpm prisma db push`
4. Inspect browser console for errors in `useNotifications` hook

### Badge counter not updating

1. Verify polling is active (check Network tab, requests every 30s)
2. Clear TanStack Query cache: `queryClient.invalidateQueries()`
3. Check `getUnreadCount()` returns correct value

### Notifications not translating

1. Verify translation keys exist in all language files (en/id/ar.json)
2. Check `useTranslations()` hook is called correctly
3. Inspect locale context in browser devtools

## Dependencies

```json
{
  "@prisma/client": "^6.19.0",
  "@tanstack/react-query": "^5.17.0",
  "@radix-ui/react-scroll-area": "^1.2.10",
  "date-fns": "^3.0.6",
  "lucide-react": "^0.303.0"
}
```

## Related Documentation

- [Attendance System](./ATTENDANCE_SYSTEM.md) - Clock-in/out triggers
- [RBAC System](./RBAC_SYSTEM.md) - Role-based notification recipients
- [Technical Documentation](./TECHNICAL.md) - Architecture overview
