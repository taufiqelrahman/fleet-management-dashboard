"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

function generateSimpleFingerprint(): string {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;

  const fingerprint = `${ua}-${screen}-${timezone}-${language}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function parseUserAgent() {
  const ua = navigator.userAgent.toLowerCase();

  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet";
  }

  let browser = "Unknown";
  let browserVersion = "";

  if (ua.includes("edg/")) {
    browser = "Edge";
    browserVersion = ua.match(/edg\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("chrome/") && !ua.includes("edg/")) {
    browser = "Chrome";
    browserVersion = ua.match(/chrome\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("firefox/")) {
    browser = "Firefox";
    browserVersion = ua.match(/firefox\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("safari/") && !ua.includes("chrome/")) {
    browser = "Safari";
    browserVersion = ua.match(/version\/([\d.]+)/)?.[1] || "";
  }

  let os = "Unknown";
  let osVersion = "";

  if (ua.includes("windows")) {
    os = "Windows";
    if (ua.includes("windows nt 10.0")) osVersion = "10/11";
  } else if (ua.includes("mac os x")) {
    os = "macOS";
    osVersion = ua.match(/mac os x ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("android")) {
    os = "Android";
    osVersion = ua.match(/android ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
    osVersion = ua.match(/os ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return { deviceType, browser, browserVersion, os, osVersion };
}

export function useDeviceRegistration() {
  const { data: session, status } = useSession();

  useEffect(() => {
    async function registerDevice() {
      if (status !== "authenticated" || !session?.user) return;

      try {
        const deviceInfo = parseUserAgent();
        const deviceFingerprint = generateSimpleFingerprint();

        await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...deviceInfo,
            deviceFingerprint,
            name: `${deviceInfo.deviceType} - ${deviceInfo.os} ${deviceInfo.browser}`,
          }),
        });
      } catch (error) {
        console.error("Failed to register device:", error);
      }
    }

    registerDevice();
  }, [status, session]);
}
