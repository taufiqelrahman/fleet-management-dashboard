import {
  parseUserAgent,
  generateDeviceFingerprint,
  getDeviceDisplayName,
} from "@/lib/device-utils";

describe("Device Utils", () => {
  describe("parseUserAgent", () => {
    it("should parse Chrome on Windows", () => {
      const ua =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Chrome");
      expect(result.os).toBe("Windows");
      expect(result.deviceType).toBe("desktop");
    });

    it("should parse Safari on macOS", () => {
      const ua =
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Safari");
      expect(result.os).toBe("macOS");
      expect(result.deviceType).toBe("desktop");
    });

    it("should parse Chrome on Android mobile", () => {
      const ua =
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Chrome");
      expect(result.os).toBe("Android");
      expect(result.deviceType).toBe("mobile");
    });

    it("should parse Safari on iOS", () => {
      const ua =
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const result = parseUserAgent(ua);

      expect(result.browser).toBe("Safari");
      expect(result.os).toBe("iOS");
      expect(result.deviceType).toBe("mobile");
    });
  });

  describe("generateDeviceFingerprint", () => {
    it("should generate consistent fingerprint for same data", () => {
      const data = {
        userId: "user123",
        userAgent: "test-agent",
        browser: "Chrome",
        os: "Windows",
      };

      const fingerprint1 = generateDeviceFingerprint(data);
      const fingerprint2 = generateDeviceFingerprint(data);

      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toHaveLength(64); // SHA-256 hex length
    });

    it("should generate different fingerprints for different data", () => {
      const data1 = {
        userId: "user123",
        userAgent: "test-agent",
        browser: "Chrome",
        os: "Windows",
      };

      const data2 = {
        userId: "user456",
        userAgent: "test-agent",
        browser: "Chrome",
        os: "Windows",
      };

      const fingerprint1 = generateDeviceFingerprint(data1);
      const fingerprint2 = generateDeviceFingerprint(data2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe("getDeviceDisplayName", () => {
    it("should format device display name correctly", () => {
      const deviceInfo = {
        deviceType: "mobile",
        browser: "Chrome",
        browserVersion: "120.0",
        os: "Android",
        osVersion: "13",
      };

      const displayName = getDeviceDisplayName(deviceInfo);

      expect(displayName).toBe("Mobile - Android Chrome");
    });

    it("should capitalize device type", () => {
      const deviceInfo = {
        deviceType: "desktop",
        browser: "Firefox",
        browserVersion: "120.0",
        os: "Windows",
        osVersion: "10",
      };

      const displayName = getDeviceDisplayName(deviceInfo);

      expect(displayName).toBe("Desktop - Windows Firefox");
    });
  });
});
