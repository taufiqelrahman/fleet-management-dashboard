"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/actions/notifications";

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notificationsResult, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const result = await getNotifications(20);
      if (!result.success) throw new Error(result.message);
      return result.data ?? [];
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const { data: unreadCountResult } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const result = await getUnreadCount();
      if (!result.success) throw new Error(result.message);
      return result.data ?? 0;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });

  return {
    notifications: notificationsResult ?? [],
    unreadCount: unreadCountResult ?? 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
  };
}
