# E2E Testing with Playwright

This directory contains end-to-end tests for the NextFleet application using Playwright.

## Test Structure

```
e2e/
├── auth.spec.ts           # Authentication flow tests
├── dashboard.spec.ts      # Dashboard page tests
├── vehicles.spec.ts       # Vehicle CRUD operations tests
├── analytics.spec.ts      # Analytics page tests
├── i18n.spec.ts          # Internationalization tests
├── accessibility.spec.ts  # Accessibility (a11y) tests
└── helpers.ts            # Test helper functions
```

## Running Tests

### Run all tests (headless mode)

```bash
pnpm test:e2e
```

### Run tests in UI mode (interactive)

```bash
pnpm test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
pnpm test:e2e:headed
```

### Run tests in debug mode

```bash
pnpm test:e2e:debug
```

### Run specific test file

```bash
pnpm test:e2e auth.spec.ts
```

### Run tests for specific browser

```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### View test report

```bash
pnpm test:e2e:report
```

## Test Coverage

### Authentication Tests (`auth.spec.ts`)

- ✅ Redirect unauthenticated users to login
- ✅ Login with valid credentials
- ✅ Show error with invalid credentials
- ✅ Logout successfully

### Dashboard Tests (`dashboard.spec.ts`)

- ✅ Display dashboard statistics
- ✅ Display charts
- ✅ Navigate to vehicles page
- ✅ Navigate to analytics page
- ✅ Show loading state

### Vehicles Tests (`vehicles.spec.ts`)

- ✅ Display vehicles list
- ✅ Create new vehicle (Admin only)
- ✅ Export to CSV
- ✅ Export to PDF
- ✅ Operator role restrictions

### Analytics Tests (`analytics.spec.ts`)

- ✅ Display analytics page
- ✅ Display all charts
- ✅ Load chart data

### i18n Tests (`i18n.spec.ts`)

- ✅ Switch to Indonesian language
- ✅ Switch to Arabic language with RTL
- ✅ Persist language across navigation
- ✅ Translate all UI elements
- ✅ Access pages directly via locale URL

### Accessibility Tests (`accessibility.spec.ts`)

- ✅ No accessibility violations on login page
- ✅ No accessibility violations on dashboard
- ✅ No accessibility violations on vehicles page
- ✅ Keyboard navigation
- ✅ Proper ARIA labels

## Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Trace**: On first retry

## Prerequisites

1. **Development server must be running**:

   ```bash
   pnpm dev
   ```

   Or tests will automatically start the dev server (configured in `webServer` option).

2. **Database must be seeded** with test data:
   ```bash
   pnpm prisma:seed
   ```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should do something", async ({ page }) => {
    await page.goto("/en/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});
```

### Using Helpers

```typescript
import { loginAsAdmin, navigateToPage, waitForToast } from "./helpers";

test("should create vehicle", async ({ page }) => {
  await loginAsAdmin(page);
  await navigateToPage(page, "en", "/dashboard/vehicles");

  // ... perform actions ...

  await waitForToast(page, /success/i);
});
```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network requests** to complete before assertions
3. **Use beforeEach** for common setup (login, navigation)
4. **Keep tests independent** - don't rely on state from other tests
5. **Use descriptive test names** - "should do X when Y"
6. **Test user journeys** - not just individual functions
7. **Include accessibility tests** - use axe-core

## Debugging

### Visual Debugging with UI Mode

```bash
pnpm test:e2e:ui
```

This opens an interactive UI where you can:

- See all tests
- Run tests step-by-step
- Time-travel through test execution
- Inspect DOM snapshots

### Debug with Playwright Inspector

```bash
pnpm test:e2e:debug
```

This opens Playwright Inspector with:

- Step-through debugging
- DOM snapshots
- Network logs
- Console logs

### Screenshots and Videos

Failed tests automatically generate:

- Screenshots (in `test-results/`)
- Traces (viewable with `playwright show-trace trace.zip`)

## CI/CD Integration

Tests run automatically on CI with:

- Retries: 2 attempts
- Workers: 1 (serial execution)
- Screenshots: On failure
- Videos: On failure

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright Browsers
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests are flaky

- Add explicit waits: `await page.waitForSelector()`
- Increase timeout: `{ timeout: 10000 }`
- Check network requests: `await page.waitForResponse()`

### Authentication fails

- Verify database is seeded
- Check credentials in test helpers
- Clear browser storage: `await context.clearCookies()`

### Language switching doesn't work

- Wait for URL change: `await page.waitForURL(/.*\/id\/dashboard/)`
- Check middleware is running
- Verify translation files exist

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Axe Accessibility Testing](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
