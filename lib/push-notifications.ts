import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Configure VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
};

// Only set VAPID details if keys are properly configured
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  try {
    webpush.setVapidDetails(
      "mailto:admin@nextfleet.com",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  } catch (error) {
    console.warn(
      "Failed to set VAPID details. Push notifications will not work:",
      error
    );
  }
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    notificationId?: string;
    [key: string]: unknown;
  };
}

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
) {
  try {
    // Get all subscriptions for the user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return { success: true, sent: 0 };
    }

    // Send notification to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            JSON.stringify(payload)
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: unknown) {
          console.error(
            `Failed to send push to ${subscription.endpoint}:`,
            error
          );

          const err = error as { statusCode?: number };
          // Remove invalid/expired subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: subscription.id },
            });
            console.log(
              `Removed invalid subscription: ${subscription.endpoint}`
            );
          }

          return { success: false, endpoint: subscription.endpoint, error };
        }
      })
    );

    const sentCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;

    return { success: true, sent: sentCount, total: subscriptions.length };
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return { success: false, error };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.all(
    userIds.map((userId) => sendPushNotification(userId, payload))
  );

  const totalSent = results.reduce((sum, r) => sum + (r.sent || 0), 0);
  const totalUsers = userIds.length;

  return { success: true, sent: totalSent, users: totalUsers };
}

/**
 * Send push notification to users with specific roles
 */
export async function sendPushByRole(roles: string[], payload: PushPayload) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: roles as (
          | "ADMIN"
          | "OPERATOR"
          | "EMPLOYEE"
          | "SUPERVISOR"
          | "HR"
        )[],
      },
    },
    select: { id: true },
  });

  const userIds = users.map((u) => u.id);
  return sendPushToUsers(userIds, payload);
}
