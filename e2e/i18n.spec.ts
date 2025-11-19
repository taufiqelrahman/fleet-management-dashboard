import { test, expect } from "@playwright/test";

test.describe("Internationalization (i18n)", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);
  });

  test("should switch to Indonesian language", async ({ page }) => {
    // Click language switcher button (has Languages icon)
    await page.click('button:has([class*="lucide-languages"])');

    // Wait for dropdown to open
    await page.waitForTimeout(500);

    // Select Indonesian
    await page.click('[role="menuitem"]:has-text("Indonesia")');

    // URL should change to /id
    await expect(page).toHaveURL(/.*\/id\/dashboard/, { timeout: 3000 });

    // Check for Indonesian text
    await expect(page.locator("text=Dasbor")).toBeVisible();
  });

  test("should switch to Arabic language with RTL", async ({ page }) => {
    // Click language switcher button (has Languages icon)
    await page.click('button:has([class*="lucide-languages"])');

    // Wait for dropdown to open
    await page.waitForTimeout(500);

    // Select Arabic
    await page.click('[role="menuitem"]:has-text("العربية")');

    // URL should change to /ar
    await expect(page).toHaveURL(/.*\/ar\/dashboard/, { timeout: 3000 });

    // Check RTL direction
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");

    // Check for Arabic text
    await expect(page.locator("text=لوحة التحكم")).toBeVisible();
  });

  test("should persist language across navigation", async ({ page }) => {
    // Switch to Indonesian
    await page.click('button:has([class*="lucide-languages"])');
    await page.waitForTimeout(500);
    await page.click('[role="menuitem"]:has-text("Indonesia")');
    await expect(page).toHaveURL(/.*\/id\/dashboard/, { timeout: 3000 });

    // Navigate to vehicles
    await page.click('a:has-text("Kendaraan")');
    await expect(page).toHaveURL(/.*\/id\/dashboard\/vehicles/);

    // Should still be in Indonesian
    await expect(page.locator("text=Kendaraan")).toBeVisible();
  });

  test("should translate all UI elements in Indonesian", async ({ page }) => {
    // Switch to Indonesian
    await page.click('button:has([class*="lucide-languages"])');
    await page.waitForTimeout(500);
    await page.click('[role="menuitem"]:has-text("Indonesia")');
    await expect(page).toHaveURL(/.*\/id\/dashboard/, { timeout: 3000 });

    // Check translated elements
    await expect(page.locator("text=Total Kendaraan")).toBeVisible();
    await expect(page.locator("text=Kendaraan Aktif")).toBeVisible();
  });

  test("should translate all UI elements in Arabic", async ({ page }) => {
    // Switch to Arabic
    await page.click('button:has([class*="lucide-languages"])');
    await page.waitForTimeout(500);
    await page.click('[role="menuitem"]:has-text("العربية")');
    await expect(page).toHaveURL(/.*\/ar\/dashboard/, { timeout: 3000 });

    // Check translated elements
    await expect(page.locator("text=إجمالي المركبات")).toBeVisible();
    await expect(page.locator("text=المركبات النشطة")).toBeVisible();
  });

  test("should access pages directly via locale URL", async ({ page }) => {
    // Go directly to Indonesian vehicles page
    await page.goto("/id/dashboard/vehicles");

    // Should be in Indonesian
    await expect(page.locator("h1:has-text('Kendaraan')")).toBeVisible();

    // Go directly to Arabic analytics page
    await page.goto("/ar/dashboard/analytics");

    // Should be in Arabic with RTL
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(page.locator("text=التحليلات")).toBeVisible();
  });
});
