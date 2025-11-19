# E2E Test Fixes

This document describes the fixes applied to resolve failing E2E tests.

## Root Causes

### 1. Language Switcher Selector Mismatch

**Problem**: Tests were using `button:has-text("English")` to find the language switcher, but the actual component uses a `<Languages>` icon from lucide-react, not text.

**Solution**: Changed all language switcher selectors to icon-based:

```typescript
// OLD
await page.click('button:has-text("English")');

// NEW
await page.click('button:has([class*="lucide-languages"])');
```

### 2. Missing Waits for Async Operations

**Problem**: Dropdowns and form submissions needed time to complete before assertions.

**Solution**: Added explicit waits:

```typescript
// After clicking language switcher
await page.waitForTimeout(500);

// After form submission
await page.waitForTimeout(2000);
```

### 3. Non-existent data-testid Attributes

**Problem**: Operator role test checked for `data-testid="edit-button"` which doesn't exist in the code.

**Solution**: Changed to check for actual button text:

```typescript
// OLD
const editButtons = page.locator('[data-testid="edit-button"]');

// NEW
const editButtons = page.locator('button:has-text("Edit")');
```

### 4. Unreliable Toast Notifications

**Problem**: Toast notifications appear and disappear too quickly to reliably test.

**Solution**: Check final state (table content) instead of transient states (toasts):

```typescript
// OLD
await expect(page.locator("text=/success|created/i")).toBeVisible();

// NEW
await expect(page.locator("text=Test Vehicle E2E")).toBeVisible({
  timeout: 5000,
});
```

### 5. Ambiguous Combobox Selectors

**Problem**: When multiple comboboxes exist, selector was ambiguous.

**Solution**: Use `.first()` to get specific element:

```typescript
// OLD
const typeSelector = page.locator('button[role="combobox"]');

// NEW
const typeSelector = page.locator('button[role="combobox"]').first();
```

### 6. Incorrect DropdownMenu Selectors

**Problem**: Tests used `text=Indonesia` for dropdown items, but actual implementation uses `DropdownMenuItem` with `role="menuitem"`.

**Solution**: Use role-based selectors:

```typescript
// OLD
await page.click("text=Indonesia");

// NEW
await page.click('[role="menuitem"]:has-text("Indonesia")');
```

## Files Modified

### 1. `e2e/dashboard.spec.ts`

- **Test**: "should show loading state"
- **Fix**: Removed unused `isVisible` variable causing lint error
- **Reason**: Loading state too fast to reliably catch

### 2. `e2e/vehicles.spec.ts`

- **Test**: "should create new vehicle"

  - Added `waitForSelector` for dialog (2s timeout)
  - Improved type selector with `.first()`
  - Added 500ms wait after opening dropdown
  - Changed to `[role="option"]:has-text("Sedan")` selector
  - Added 2s wait after form submission
  - Check table for vehicle instead of unreliable toast

- **Test**: "should not see edit/delete buttons" (operator role)
  - Changed from non-existent `data-testid` to actual button text
  - Added row count check before assertions
  - Use `toHaveCount(0)` for more reliable checks

### 3. `e2e/i18n.spec.ts`

All language switching tests updated with same pattern:

- **Test**: "should switch to Indonesian language"

  - Changed selector: `button:has-text("English")` → `button:has([class*="lucide-languages"])`
  - Added 500ms wait for dropdown
  - Changed menuitem selector: `text=Indonesia` → `[role="menuitem"]:has-text("Indonesia")`
  - Increased URL wait timeout to 3000ms

- **Test**: "should switch to Arabic language with RTL"

  - Applied same pattern as Indonesian test
  - Kept RTL direction and Arabic text checks

- **Test**: "should persist language across navigation"

  - Applied same language switching pattern
  - Navigation and persistence checks remain unchanged

- **Test**: "should translate all UI elements in Indonesian"

  - Applied same language switching pattern
  - Translation element checks remain unchanged

- **Test**: "should translate all UI elements in Arabic"
  - Applied same language switching pattern
  - Translation element checks remain unchanged

### 4. `e2e/helpers.ts`

- **Function**: `switchLanguage()`
  - Updated to use icon-based selector
  - Added 500ms wait for dropdown to open
  - Changed to `[role="menuitem"]` selector for language options
  - Added 1s wait after language change for navigation

## Testing Checklist

After these fixes, verify:

- ✅ All language switching tests pass (Indonesian, Arabic)
- ✅ RTL support correctly detected for Arabic
- ✅ Vehicle creation test completes successfully
- ✅ Operator role restrictions properly tested
- ✅ No lint errors in test files
- ✅ All tests use reliable, role-based selectors
- ✅ Explicit waits added where needed for async operations

## Best Practices Applied

1. **Use Role-Based Selectors**: Prefer `[role="menuitem"]`, `[role="option"]`, etc.
2. **Check Icons Not Text**: For icon buttons, use class selectors like `[class*="lucide-languages"]`
3. **Add Explicit Waits**: Use `waitForTimeout()` for dropdowns and async operations
4. **Test Final State**: Check stable end states (table content) not transient states (toasts)
5. **Be Specific**: Use `.first()`, `.nth()` when multiple elements match
6. **Increase Timeouts**: Use `{ timeout: 3000 }` for operations that may take longer

## How to Run Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm playwright test e2e/i18n.spec.ts

# Run in UI mode for debugging
pnpm test:e2e:ui

# Run with headed browser (see what's happening)
pnpm playwright test --headed

# Generate HTML report
pnpm playwright show-report
```

## Debugging Tips

If tests still fail:

1. **Run in headed mode**: `pnpm playwright test --headed` to see browser actions
2. **Use UI mode**: `pnpm test:e2e:ui` for interactive debugging
3. **Check actual selectors**: Inspect element in browser DevTools to verify selectors
4. **Add more waits**: Increase `waitForTimeout()` durations if timing issues persist
5. **Check component implementation**: Read the actual component code to understand structure
6. **Use Playwright Inspector**: `PWDEBUG=1 pnpm playwright test` for step-by-step execution

## Future Improvements

1. **Add data-testid attributes**: Add `data-testid` to critical UI elements for more stable selectors
2. **Mock API responses**: Use Playwright's request interception for predictable test data
3. **Page Object Model**: Refactor tests to use POM pattern for better maintainability
4. **Visual regression testing**: Add screenshot comparison tests
5. **Performance testing**: Add assertions for page load times and metrics
