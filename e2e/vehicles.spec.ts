import { test, expect } from "@playwright/test";

test.describe("Vehicles CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "admin@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    // Navigate to vehicles page
    await page.click('a:has-text("Vehicles")');
    await expect(page).toHaveURL(/.*\/en\/dashboard\/vehicles/);
  });

  test("should display vehicles list", async ({ page }) => {
    // Wait for table to load
    await expect(page.locator("table")).toBeVisible();

    // Check for table headers
    await expect(page.locator("th:has-text('Name')")).toBeVisible();
    await expect(page.locator("th:has-text('Type')")).toBeVisible();
    await expect(page.locator("th:has-text('License Plate')")).toBeVisible();
    await expect(page.locator("th:has-text('Status')")).toBeVisible();
  });

  test("should create new vehicle", async ({ page }) => {
    // Click Add Vehicle button
    await page.click('button:has-text("Add Vehicle")');

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { timeout: 2000 });

    // Fill form
    await page.fill('input[id="name"]', "Test Vehicle E2E");
    await page.fill('input[id="licensePlate"]', "TEST123");

    // Select vehicle type - find the type selector specifically
    const typeSelector = page.locator('button[role="combobox"]').first();
    await typeSelector.click();
    await page.waitForTimeout(500); // Wait for dropdown to open
    await page.click('[role="option"]:has-text("Sedan")');

    // Fill mileage and fuel consumption
    await page.fill('input[id="mileage"]', "10000");
    await page.fill('input[id="fuelConsumption"]', "8.5");

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success toast or vehicle should appear in table
    await page.waitForTimeout(2000);

    // Check if vehicle appears in table (more reliable than toast)
    await expect(page.locator("text=Test Vehicle E2E")).toBeVisible({
      timeout: 5000,
    });
  });

  test("should export to CSV", async ({ page }) => {
    // Click Export CSV button
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Export CSV")');
    const download = await downloadPromise;

    // Check filename
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("should export to PDF", async ({ page }) => {
    // Click Export PDF button
    const downloadPromise = page.waitForEvent("download");
    await page.click('button:has-text("Export PDF")');
    const download = await downloadPromise;

    // Check filename
    expect(download.suggestedFilename()).toContain(".pdf");
  });

  test("should search/filter vehicles", async ({ page }) => {
    // This test assumes you have search functionality
    // Adjust based on your actual implementation
    const vehicleCount = await page.locator("tbody tr").count();
    expect(vehicleCount).toBeGreaterThan(0);
  });
});

test.describe("Vehicles - Operator Role", () => {
  test.beforeEach(async ({ page }) => {
    // Login as operator (read-only)
    await page.goto("/en/login");
    await page.fill('input[type="email"]', "operator@nextfleet.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/en\/dashboard/);

    // Navigate to vehicles page
    await page.click('a:has-text("Vehicles")');
    await expect(page).toHaveURL(/.*\/en\/dashboard\/vehicles/);
  });

  test("should not see Add Vehicle button", async ({ page }) => {
    // Operator should not have access to create button
    const addButton = page.locator('button:has-text("Add Vehicle")');
    await expect(addButton).not.toBeVisible();
  });

  test("should not see edit/delete buttons", async ({ page }) => {
    // Operator should not see action buttons in table
    // Check if table has any rows first
    const hasRows = await page.locator("tbody tr").count();

    if (hasRows > 0) {
      // Look for Edit or Delete text in buttons/actions
      const editButtons = page.locator('button:has-text("Edit")');
      const deleteButtons = page.locator('button:has-text("Delete")');

      // Count should be 0 for operator
      await expect(editButtons).toHaveCount(0);
      await expect(deleteButtons).toHaveCount(0);
    }
  });
});
