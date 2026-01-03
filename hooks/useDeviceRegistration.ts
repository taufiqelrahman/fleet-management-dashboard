"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * Device registration hook
 * Note: This is now primarily for updating lastActive timestamp
 * Device creation is handled server-side during login in trackLoginAttempt()
 */
export function useDeviceRegistration() {
  const { data: session, status } = useSession();

  useEffect(() => {
    async function updateDeviceActivity() {
      if (status !== "authenticated" || !session?.user) return;

      try {
        // Only update lastActive timestamp, not creating new devices
        // Device creation happens server-side on login
        await fetch("/api/devices/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Failed to update device activity:", error);
      }
    }

    // Update device activity every 5 minutes
    updateDeviceActivity();
    const interval = setInterval(updateDeviceActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [status, session]);
}
