import { Page } from "@playwright/test";

/**
 * Helper function to login as admin
 */
export async function loginAsAdmin(page: Page) {
  await page.goto("/en/login");
  await page.fill('input[type="email"]', "admin@nextfleet.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*\/en\/dashboard/);
}

/**
 * Helper function to login as operator
 */
export async function loginAsOperator(page: Page) {
  await page.goto("/en/login");
  await page.fill('input[type="email"]', "operator@nextfleet.com");
  await page.fill('input[type="password"]', "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*\/en\/dashboard/);
}

/**
 * Helper function to navigate to a specific locale and page
 */
export async function navigateToPage(
  page: Page,
  locale: "en" | "id" | "ar",
  path: string
) {
  await page.goto(`/${locale}${path}`);
}

/**
 * Helper function to switch language
 */
export async function switchLanguage(
  page: Page,
  language: "English" | "Indonesia" | "العربية"
) {
  // Open language switcher dropdown
  await page.click('button[role="combobox"]');

  // Click the language option
  await page.click(`text=${language}`);
}

/**
 * Helper function to wait for toast notification
 */
export async function waitForToast(
  page: Page,
  message: string | RegExp,
  timeout = 5000
) {
  await page.waitForSelector(`text=${message}`, { timeout });
}

/**
 * Helper function to check if user has admin permissions
 */
export async function isAdmin(page: Page): Promise<boolean> {
  const addButton = page.locator('button:has-text("Add Vehicle")');
  return await addButton.isVisible().catch(() => false);
}
