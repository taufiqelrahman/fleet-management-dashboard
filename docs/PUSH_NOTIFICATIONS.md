# Web Push Notifications

## Overview

NextFleet implements browser push notifications using the Web Push API with VAPID (Voluntary Application Server Identification) authentication. This enables real-time alerts for critical events even when users are not actively viewing the application.

## Architecture

### Components

1. **Client-Side**

   - `components/push-notification-toggle.tsx` - UI component for managing notification permissions
   - Service Worker registration and subscription management
   - Notification permission requests

2. **Server-Side**

   - `app/api/push/subscribe/route.ts` - API endpoint for managing push subscriptions
   - `lib/push-notifications.ts` - Helper functions for sending push notifications
   - `prisma/schema.prisma` - PushSubscription database model

3. **Background**
   - `public/service-worker.js` - Service worker for handling push events

### Database Schema

```prisma
model PushSubscription {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint   String   @unique
  p256dh     String   // Public key for message encryption
  auth       String   // Authentication secret
  userAgent  String?  // Browser/device information
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}
```

## Setup

### 1. Generate VAPID Keys

Generate a pair of VAPID keys for authenticating push notifications:

```bash
pnpm exec web-push generate-vapid-keys
```

This will output something like:

```
=======================================

Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SzV8-EV2xrF...

Private Key:
bdSiGDhqfNzqRxAFNsmBxdZ9Zqu7K...

=======================================
```

### 2. Configure Environment Variables

Add the generated keys to your `.env.local` file:

```env
# Web Push Notifications (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key-here"
VAPID_PRIVATE_KEY="your-private-vapid-key-here"
```

**Important:**

- The public key is prefixed with `NEXT_PUBLIC_` because it needs to be accessible in client-side code
- The private key MUST be kept secret and never exposed to clients

### 3. Update Database

Run Prisma migrations to add the PushSubscription table:

```bash
pnpm prisma:generate
pnpm prisma:push
```

## Usage

### Requesting Notification Permissions

The `PushNotificationToggle` component is already integrated into the navbar and sidebar. Users can click the bell icon to:

1. Request browser notification permission
2. Register the service worker
3. Subscribe to push notifications
4. Manage their subscription status

### Sending Push Notifications

#### Send to a Specific User

```typescript
import { sendPushNotification } from "@/lib/push-notifications";

await sendPushNotification("user-id-here", {
  title: "New Message",
  body: "You have a new message from John",
  icon: "/icon-192x192.png",
  badge: "/badge-72x72.png",
  data: {
    url: "/en/dashboard/messages",
    notificationId: "msg-123",
  },
});
```

#### Send to Multiple Users

```typescript
import { sendPushToUsers } from "@/lib/push-notifications";

await sendPushToUsers(["user-1", "user-2", "user-3"], {
  title: "Team Update",
  body: "The team meeting has been rescheduled",
  data: { url: "/en/dashboard/schedules" },
});
```

#### Send to Users by Role

```typescript
import { sendPushByRole } from "@/lib/push-notifications";

await sendPushByRole(["Admin", "Operator"], {
  title: "Vehicle Alert",
  body: "Vehicle ABC-123 requires immediate maintenance",
  data: { url: "/en/dashboard/vehicles" },
});
```

### Notification Payload Structure

```typescript
interface PushPayload {
  title: string; // Notification title
  body: string; // Notification body text
  icon?: string; // Icon URL (default: /icon-192x192.png)
  badge?: string; // Badge URL (default: /badge-72x72.png)
  data?: {
    url?: string; // URL to navigate when clicked
    notificationId?: string; // Optional ID for tracking
    [key: string]: any; // Any additional custom data
  };
}
```

## Integration Examples

### Clock-In/Out Notifications

```typescript
// In actions/attendance.ts
import { sendPushNotification } from "@/lib/push-notifications";

export async function clockIn(userId: string, location: Location) {
  // ... existing clock-in logic ...

  // Send push notification
  await sendPushNotification(userId, {
    title: t("notifications.clockIn"),
    body: t("notifications.clockInSuccess"),
    data: {
      url: "/en/dashboard/attendance",
      type: "CLOCK_IN",
    },
  });
}
```

### Vehicle Status Changes

```typescript
// In actions/vehicles.ts
import { sendPushByRole } from "@/lib/push-notifications";

export async function updateVehicleStatus(
  vehicleId: string,
  newStatus: VehicleStatus
) {
  // ... existing update logic ...

  if (newStatus === "MAINTENANCE") {
    // Notify admins and operators
    await sendPushByRole(["Admin", "Operator"], {
      title: "Vehicle Maintenance Alert",
      body: `Vehicle ${vehicleName} is now in maintenance`,
      data: {
        url: `/en/dashboard/vehicles/${vehicleId}`,
        vehicleId,
        type: "VEHICLE_STATUS_CHANGE",
      },
    });
  }
}
```

### Maintenance Reminders

```typescript
// In a cron job or scheduled task
import { sendPushToUsers } from "@/lib/push-notifications";

async function sendMaintenanceReminders() {
  const upcomingMaintenance = await getVehiclesNeedingMaintenance();

  for (const vehicle of upcomingMaintenance) {
    const userIds = await getUsersResponsibleForVehicle(vehicle.id);

    await sendPushToUsers(userIds, {
      title: "Maintenance Reminder",
      body: `${vehicle.name} needs maintenance in ${vehicle.daysUntilMaintenance} days`,
      data: {
        url: `/en/dashboard/vehicles/${vehicle.id}`,
        vehicleId: vehicle.id,
        type: "MAINTENANCE_REMINDER",
      },
    });
  }
}
```

## Service Worker

The service worker (`public/service-worker.js`) handles three main events:

### 1. Push Event

Displays the notification when a push message is received:

```javascript
self.addEventListener("push", (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: data.badge || "/badge-72x72.png",
    vibrate: [200, 100, 200],
    tag: data.data?.notificationId || "general",
    renotify: true,
    data: data.data,
  });
});
```

### 2. Notification Click Event

Handles user interaction with notifications:

```javascript
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/en/dashboard";

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window or open new one
    })
  );
});
```

### 3. Push Subscription Change Event

Handles subscription updates (e.g., when keys change):

```javascript
self.addEventListener("pushsubscriptionchange", (event) => {
  event
    .waitUntil
    // Re-subscribe with new keys
    ();
});
```

## Browser Support

Web Push Notifications are supported in:

- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Opera 29+
- ✅ Samsung Internet 4+
- ⚠️ Safari 16+ (macOS 13+, iOS 16.4+ with limited support)

The `PushNotificationToggle` component automatically hides if push notifications are not supported in the user's browser.

## Security Considerations

### VAPID Keys

- **Private Key**: Never expose the private key in client-side code or commit it to version control
- **Public Key**: Safe to expose as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- **Rotation**: Generate new keys if the private key is compromised

### Subscription Management

- Subscriptions are tied to user accounts and automatically cleaned up when:
  - User account is deleted (CASCADE delete)
  - Subscription becomes invalid (410 Gone / 404 Not Found)

### Permission Requirements

- Users must explicitly grant notification permission
- Permission cannot be requested automatically on page load
- Failed permission requests are gracefully handled with user-friendly messages

## Troubleshooting

### Notifications Not Appearing

1. **Check Browser Support**: Ensure the browser supports push notifications
2. **Verify Permission**: Check if notification permission is granted
3. **Service Worker**: Ensure service worker is registered (`chrome://serviceworker-internals`)
4. **VAPID Keys**: Verify keys are correctly set in environment variables
5. **Network**: Check for failed API calls in browser DevTools

### Subscription Failures

```typescript
// Check subscription status
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.getSubscription();

if (!subscription) {
  console.log("No active subscription");
}
```

### Testing Push Notifications

Use browser DevTools to simulate push events:

1. Open DevTools → Application → Service Workers
2. Find your service worker
3. Click "Push" to send a test notification

### Common Errors

| Error               | Cause                         | Solution                                                        |
| ------------------- | ----------------------------- | --------------------------------------------------------------- |
| `NotAllowedError`   | Permission denied by user     | Prompt user to allow notifications in browser settings          |
| `NotSupportedError` | Browser doesn't support push  | Detect support and hide toggle component                        |
| `InvalidStateError` | Service worker not registered | Ensure service worker registration completes before subscribing |
| 410 Gone            | Subscription expired          | Handled automatically by cleanup logic                          |

## Performance Considerations

### Subscription Limits

- Each user can have multiple subscriptions (one per device/browser)
- Old/inactive subscriptions are automatically cleaned up
- Consider implementing subscription limits per user if needed

### Notification Rate Limiting

Avoid notification fatigue by:

- Grouping related notifications using the `tag` property
- Implementing quiet hours (no notifications during off-hours)
- Allowing users to configure notification preferences
- Batching notifications for non-urgent events

### Database Indexing

The PushSubscription model includes indexes on:

- `userId` - Fast lookups by user
- `endpoint` - Unique constraint prevents duplicates

## Future Enhancements

- [ ] Notification preference settings (user can choose notification types)
- [ ] Quiet hours configuration
- [ ] Notification history/archive
- [ ] Rich notifications with images and actions
- [ ] Notification grouping and batching
- [ ] Push notification analytics (delivery rate, click-through rate)

## References

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
- [web-push library](https://github.com/web-push-libs/web-push)
