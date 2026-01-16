# Dark/Light Mode Implementation

## Overview

NextFleet now supports dark/light mode theming using `next-themes` library. Users can toggle between light and dark modes, and the application will remember their preference.

## Features

- ✅ System preference detection (automatically follows OS settings)
- ✅ Manual theme switching (light/dark toggle)
- ✅ Persistent theme preference (saved in localStorage)
- ✅ Smooth transitions (150ms for colors, 200ms for complex animations)
- ✅ No flash of unstyled content on page load
- ✅ Accessible with keyboard navigation and screen readers
- ✅ **Multi-language support** (EN, ID, AR)
- ✅ **Hydration-safe implementation** with suppressHydrationWarning
- ✅ Available in sidebar next to language switcher

## Components

### ThemeProvider (`app/providers.tsx`)

Wraps the entire application with `next-themes` ThemeProvider:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

**Configuration:**

- `attribute="class"` - Uses class-based theme switching (adds `.dark` to `<html>`)
- `defaultTheme="system"` - Defaults to system preference
- `enableSystem` - Enables system preference detection
- `disableTransitionOnChange` - Prevents transition flash on theme change

### ThemeToggle Component (`components/ui/theme-toggle.tsx`)

A button component that toggles between light and dark modes with i18n support.

**Features:**

- Sun icon for dark mode (suggests switching to light)
- Moon icon for light mode (suggests switching to dark)
- Tooltip showing next theme in user's language
- Smooth icon transition
- Prevents hydration mismatch with `mounted` state
- **Fully translated** using next-intl

**Translations:**

- `theme.toggleTheme` - Accessibility label
- `theme.lightMode` - Light mode label
- `theme.darkMode` - Dark mode label

**Usage:**

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

<ThemeToggle />;
```

### Hydration Fix (`app/[locale]/layout.tsx`)

Added `suppressHydrationWarning` to prevent hydration errors:

```tsx
<html lang={locale} dir={isRTL ? "rtl" : "ltr"} suppressHydrationWarning>
```

This is necessary because next-themes dynamically adds `className="dark"` and `style` attributes to `<html>` on the client side based on user preference.

## Placement

### Mobile Sidebar

- Located between LocaleSwitcher and PushNotificationToggle
- Full button with icon

### Desktop Sidebar (Expanded)

- **Positioned next to LocaleSwitcher** for easy access
- Grouped in a dedicated row above notifications
- Full button with icon and tooltip

### Desktop Sidebar (Collapsed)

- Theme toggle not shown in collapsed state
- LocaleSwitcher available as icon-only button

## CSS Variables

Theme colors are defined in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other light mode variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark mode variables */
}
```

All components use these CSS variables via Tailwind utilities:

- `bg-background` - Background color
- `text-foreground` - Text color
- `bg-card` - Card background
- etc.

## Transition Standards

Standardized transition durations across the application:

- **150ms** - Simple state changes (colors, opacity)
- **200ms** - Complex animations (transforms, slides)

Set as default in `tailwind.config.ts`:

```typescript
transitionDuration: {
  DEFAULT: "150",
}
```

## Internationalization

Theme toggle supports three languages:

### English (en.json)

```json
"theme": {
  "toggleTheme": "Toggle theme",
  "lightMode": "Light Mode",
  "darkMode": "Dark Mode"
}
```

### Indonesian (id.json)

```json
"theme": {
  "toggleTheme": "Ubah tema",
  "lightMode": "Mode Terang",
  "darkMode": "Mode Gelap"
}
```

### Arabic (ar.json)

```json
"theme": {
  "toggleTheme": "تبديل السمة",
  "lightMode": "الوضع الفاتح",
  "darkMode": "الوضع الداكن"
}
```

## Implementation Details

### 1. Installation

```bash
pnpm add next-themes
```

### 2. Provider Setup

Updated `app/providers.tsx` to include ThemeProvider.

### 3. Component Creation

Created `components/ui/theme-toggle.tsx` with theme switching logic and i18n integration.

### 4. Integration

Added ThemeToggle to:

- Mobile sidebar (between LocaleSwitcher and notifications)
- Desktop expanded sidebar (next to LocaleSwitcher)

### 5. Hydration Fix

Added `suppressHydrationWarning` to `<html>` element in layout to prevent React hydration errors.

### 6. Translations

Added `theme` namespace to all language files (en.json, id.json, ar.json).

### 7. Jest Setup

Added `window.matchMedia` mock to `jest.setup.js` for testing compatibility:

```javascript
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing

The theme toggle can be tested by:

1. Opening the application in browser
2. Locating the theme toggle button (Sun/Moon icon) in the sidebar, next to the language switcher
3. Clicking to switch between light and dark modes
4. Refreshing the page to verify persistence
5. Checking system preference synchronization
6. Testing in different languages (EN, ID, AR)

## Best Practices

1. **Always use CSS variables** - Don't hardcode colors
2. **Test both themes** - Ensure UI is readable in both modes
3. **Avoid theme-specific logic** - Use CSS variables instead
4. **Consider images** - Some images may need theme-specific versions
5. **Test transitions** - Ensure smooth theme switching
6. **Test in all languages** - Verify translations display correctly

## Troubleshooting

### Theme not persisting

- Check localStorage in DevTools
- Verify ThemeProvider is wrapping the app
- Check for conflicting theme providers

### Flash of wrong theme

- Ensure `disableTransitionOnChange` is set
- Check that CSS variables are loaded before hydration
- Verify proper use of `mounted` state in ThemeToggle

### Hydration errors

- Ensure `suppressHydrationWarning` is added to `<html>` element
- Check for mismatches between server and client rendering

### Icons not switching

- Verify `theme` is correctly read from `useTheme()`
- Check conditional rendering logic in ThemeToggle
- Ensure component is mounted (check `mounted` state)

### Translations not working

- Verify translation keys exist in all language files
- Check `useTranslations()` hook is properly imported
- Ensure correct namespace is used (`theme.toggleTheme`, etc.)

## Future Enhancements

- [ ] Add "Auto" option to manually select system preference
- [ ] Theme preference in user settings/database
- [ ] Custom theme colors (brand colors)
- [ ] Multiple theme presets (blue, purple, green, etc.)
- [ ] Scheduled theme switching (auto dark mode at night)

## References

- [next-themes documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [ShadCN/UI Theming](https://ui.shadcn.com/docs/theming)
- [Next.js Hydration](https://nextjs.org/docs/messages/react-hydration-error)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
