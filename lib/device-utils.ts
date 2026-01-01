import crypto from "crypto";

export interface DeviceInfo {
  deviceType: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

/**
 * Parse User-Agent string to extract device information
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet";
  }

  // Detect browser
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
  } else if (ua.includes("opera/") || ua.includes("opr/")) {
    browser = "Opera";
    browserVersion = ua.match(/(?:opera|opr)\/([\d.]+)/)?.[1] || "";
  }

  // Detect OS
  let os = "Unknown";
  let osVersion = "";

  if (ua.includes("windows")) {
    os = "Windows";
    if (ua.includes("windows nt 10.0")) osVersion = "10/11";
    else if (ua.includes("windows nt 6.3")) osVersion = "8.1";
    else if (ua.includes("windows nt 6.2")) osVersion = "8";
    else if (ua.includes("windows nt 6.1")) osVersion = "7";
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    os = "iOS";
    osVersion = ua.match(/os ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("mac os x")) {
    os = "macOS";
    osVersion = ua.match(/mac os x ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("android")) {
    os = "Android";
    osVersion = ua.match(/android ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("linux")) {
    os = "Linux";
  }

  return {
    deviceType,
    browser,
    browserVersion,
    os,
    osVersion,
  };
}

/**
 * Generate a device fingerprint
 */
export function generateDeviceFingerprint(data: {
  userId: string;
  userAgent: string;
  browser: string;
  os: string;
}): string {
  const fingerprint = `${data.userId}-${data.userAgent}-${data.browser}-${data.os}`;
  return crypto.createHash("sha256").update(fingerprint).digest("hex");
}

/**
 * Get a display name for device
 */
export function getDeviceDisplayName(deviceInfo: DeviceInfo): string {
  const { deviceType, os, browser } = deviceInfo;
  const deviceTypeLabel =
    deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  return `${deviceTypeLabel} - ${os} ${browser}`;
}
