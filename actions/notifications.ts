"use server";

import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/auth-check";
import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import type { User } from "@/lib/types";

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

type NotificationWithUser = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

// Get user's notifications (latest first)
export async function getNotifications(
  limit = 20
): Promise<ActionResponse<NotificationWithUser[]>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const userId = (authCheck.session.user as User)?.id;
  if (!userId) {
    return {
      success: false,
      message: "User ID not found",
    };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      data: notifications,
    };
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return {
      success: false,
      message: "Failed to retrieve notifications",
    };
  }
}

// Get unread notification count
export async function getUnreadCount(): Promise<ActionResponse<number>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const userId = (authCheck.session.user as User)?.id;
  if (!userId) {
    return {
      success: false,
      message: "User ID not found",
    };
  }

  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return {
      success: false,
      message: "Failed to retrieve unread count",
    };
  }
}

// Mark notification as read
export async function markAsRead(
  notificationId: string
): Promise<ActionResponse> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const userId = (authCheck.session.user as User)?.id;
  if (!userId) {
    return {
      success: false,
      message: "User ID not found",
    };
  }

  try {
    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return {
      success: false,
      message: "Failed to update notification",
    };
  }
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<ActionResponse> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const userId = (authCheck.session.user as User)?.id;
  if (!userId) {
    return {
      success: false,
      message: "User ID not found",
    };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return {
      success: false,
      message: "Failed to update notifications",
    };
  }
}

// Create notification (internal use)
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}): Promise<ActionResponse<NotificationWithUser>> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return {
      success: false,
      message: "Failed to create notification",
    };
  }
}

// Delete notification
export async function deleteNotification(
  notificationId: string
): Promise<ActionResponse> {
  const authCheck = await checkAuth();
  if (!authCheck.authorized) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const userId = (authCheck.session.user as User)?.id;
  if (!userId) {
    return {
      success: false,
      message: "User ID not found",
    };
  }

  try {
    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notification deleted",
    };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return {
      success: false,
      message: "Failed to delete notification",
    };
  }
}
