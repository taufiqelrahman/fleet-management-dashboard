"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";

interface PushNotificationToggleProps {
  iconOnly?: boolean;
}

export function PushNotificationToggle({
  iconOnly = false,
}: PushNotificationToggleProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription status:", error);
    }
  }, [isSupported]);

  useEffect(() => {
    // Check if Push API is supported
    setIsSupported(
      "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );

    // Check current subscription status
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      await navigator.serviceWorker.ready;
      return registration;
    } catch (error) {
      console.error("Service worker registration failed:", error);
      throw error;
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast({
          title: t("notifications.permissionDenied"),
          description: t("notifications.permissionDeniedDesc"),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();

      // Subscribe to push notifications
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("VAPID public key not configured");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")!),
            auth: arrayBufferToBase64(subscription.getKey("auth")!),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setIsSubscribed(true);
      toast({
        title: t("notifications.enabled"),
        description: t("notifications.enabledDesc"),
      });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      toast({
        title: t("common.error"),
        description: t("notifications.subscribeError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }

      setIsSubscribed(false);
      toast({
        title: t("notifications.disabled"),
        description: t("notifications.disabledDesc"),
      });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      toast({
        title: t("common.error"),
        description: t("notifications.unsubscribeError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size={iconOnly ? "icon" : "sm"}
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={isLoading}
      className={iconOnly ? "" : "gap-2"}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          {!iconOnly && t("notifications.disable")}
        </>
      ) : (
        <>
          <BellRing className="h-4 w-4" />
          {!iconOnly && t("notifications.enable")}
        </>
      )}
    </Button>
  );
}
