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
- ✅ Available in sidebar (mobile and desktop views)

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

A button component that toggles between light and dark modes.

**Features:**

- Sun icon for dark mode (suggests switching to light)
- Moon icon for light mode (suggests switching to dark)
- Tooltip showing next theme
- Smooth icon transition
- Prevents hydration mismatch with `mounted` state

**Usage:**

```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

<ThemeToggle />;
```

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

## Implementation Details

### 1. Installation

```bash
pnpm add next-themes
```

### 2. Provider Setup

Updated `app/providers.tsx` to include ThemeProvider.

### 3. Component Creation

Created `components/ui/theme-toggle.tsx` with theme switching logic.

### 4. Integration

Added ThemeToggle to:

- Mobile sidebar
- Desktop sidebar (expanded)
- Desktop sidebar (collapsed)

## Testing

The theme toggle can be tested by:

1. Opening the application in browser
2. Locating the theme toggle button (Sun/Moon icon) in the sidebar
3. Clicking to switch between light and dark modes
4. Refreshing the page to verify persistence
5. Checking system preference synchronization

## Best Practices

1. **Always use CSS variables** - Don't hardcode colors
2. **Test both themes** - Ensure UI is readable in both modes
3. **Avoid theme-specific logic** - Use CSS variables instead
4. **Consider images** - Some images may need theme-specific versions
5. **Test transitions** - Ensure smooth theme switching

## Troubleshooting

### Theme not persisting

- Check localStorage in DevTools
- Verify ThemeProvider is wrapping the app
- Check for conflicting theme providers

### Flash of wrong theme

- Ensure `disableTransitionOnChange` is set
- Check that CSS variables are loaded before hydration
- Verify proper use of `mounted` state in ThemeToggle

### Icons not switching

- Verify `theme` is correctly read from `useTheme()`
- Check conditional rendering logic in ThemeToggle
- Ensure component is mounted (check `mounted` state)

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
