import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should redirect unauthenticated user to login", async ({ page }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/.*\/en\/login/);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.goto("/en/login");

    // Fill login form
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");

    // Click sign in button
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    // Should see dashboard content
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    await page.goto("/en/login");

    await page.fill('input[type="email"]', "invalid@email.com");
    await page.fill('input[type="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL(/.*\/en\/login/);

    // Should show error message (toast or inline error)
    // Note: Adjust selector based on your actual error display
    await expect(page.locator("text=/invalid|incorrect|wrong/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    // Click logout button
    await page.click('button:has-text("Logout")');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/en\/login/);
  });
});
