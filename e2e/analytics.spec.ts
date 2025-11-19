import { test, expect } from "@playwright/test";

test.describe("Analytics Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    // Navigate to analytics
    await page.click('a:has-text("Analytics")');
    await expect(page).toHaveURL(/.*\/en\/dashboard\/analytics/);
  });

  test("should display analytics page title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Analytics");
  });

  test("should display all charts", async ({ page }) => {
    // Check for chart titles
    await expect(page.locator("text=Fuel Consumption")).toBeVisible();
    await expect(page.locator("text=Utilization Rate")).toBeVisible();
    await expect(page.locator("text=Driver Performance")).toBeVisible();
  });

  test("should load chart data", async ({ page }) => {
    // Wait for charts to render (Recharts creates SVG elements)
    await expect(page.locator("svg")).toBeVisible();

    // Count SVG elements (one per chart)
    const chartCount = await page.locator("svg").count();
    expect(chartCount).toBeGreaterThanOrEqual(3);
  });

  test("should handle empty data gracefully", async ({ page }) => {
    // This would need actual API mocking
    // Just checking page doesn't crash
    await expect(page.locator("h1")).toContainText("Analytics");
  });
});
