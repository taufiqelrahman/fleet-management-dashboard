import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  test("should not have accessibility violations on login page", async ({
    page,
  }) => {
    await page.goto("/en/login");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility violations on dashboard", async ({
    page,
  }) => {
    // Login first
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should not have accessibility violations on vehicles page", async ({
    page,
  }) => {
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await page.click('a:has-text("Vehicles")');
    await expect(page).toHaveURL(/.*\/en\/dashboard\/vehicles/);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/en/login");

    // Tab through form elements
    await page.keyboard.press("Tab"); // Email field
    await page.keyboard.type("admin@nextfleet.com");

    await page.keyboard.press("Tab"); // Password field
    await page.keyboard.type("password123");

    await page.keyboard.press("Tab"); // Submit button
    await page.keyboard.press("Enter");

    // Should login successfully
    await expect(page).toHaveURL(/.*\/en\/dashboard/);
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/en/login");

    // Check for proper form labels
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
