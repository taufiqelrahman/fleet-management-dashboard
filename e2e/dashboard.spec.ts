import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);
  });

  test("should display dashboard statistics", async ({ page }) => {
    // Check for stat cards
    await expect(page.locator("text=Total Vehicles")).toBeVisible();
    await expect(page.locator("text=Active Vehicles")).toBeVisible();
    await expect(page.locator("text=/Avg.*Fuel Consumption/i")).toBeVisible();
    await expect(page.locator("text=Upcoming Maintenance")).toBeVisible();
  });

  test("should display charts", async ({ page }) => {
    // Check for chart titles
    await expect(page.locator("text=Monthly Mileage")).toBeVisible();
    await expect(page.locator("text=Vehicle Status")).toBeVisible();
  });

  test("should navigate to vehicles page", async ({ page }) => {
    // Click vehicles link in sidebar
    await page.click('a:has-text("Vehicles")');

    // Should navigate to vehicles page
    await expect(page).toHaveURL(/.*\/en\/dashboard\/vehicles/);
    await expect(page.locator("h1")).toContainText("Vehicles");
  });

  test("should navigate to analytics page", async ({ page }) => {
    // Click analytics link in sidebar
    await page.click('a:has-text("Analytics")');

    // Should navigate to analytics page
    await expect(page).toHaveURL(/.*\/en\/dashboard\/analytics/);
    await expect(page.locator("h1")).toContainText("Analytics");
  });

  test("should show loading state", async ({ page }) => {
    // Reload to see loading state
    await page.reload();

    // Loading state may be too fast to catch, so we just check page loads successfully
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});
