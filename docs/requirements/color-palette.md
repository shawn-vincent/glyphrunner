# Color Palette System

## Overview

GlyphRunner uses a systematic color approach with a **primary accent color** and **complementary color** that derive all other UI colors. This system is designed to be easily changeable by updating just the base color names.

## Current Color System

### Primary/Accent Color: **Purple**
- Light mode: `purple.500` (`#a855f7`)
- Dark mode: `purple.600` (`#9333ea`)

### Complementary Color: **Green**
- Both modes: `green.500` (`#22c55e`)

## Color Relationships & Calculations

### Base Color Mapping
```css
/* Primary colors (used for user elements) */
--primary: theme('colors.purple.500');           /* Light mode */
--accent: theme('colors.purple.500');            /* Light mode */
--sidebar-accent: theme('colors.purple.500');    /* Light mode */

/* Dark mode variants */
--primary: theme('colors.purple.600');           /* Dark mode */
--accent: theme('colors.purple.600');            /* Dark mode */  
--sidebar-accent: theme('colors.purple.600');    /* Dark mode */
```

### Complementary Color (Assistant Elements)
```css
/* Assistant message borders - both light and dark modes */
--assistant-bubble-border: theme('colors.green.500');
```

### Message Bubble Backgrounds (Tinted)
```css
/* Light mode backgrounds */
--user-bubble: rgba(245, 243, 255, 0.5);        /* Purple tint: purple.50 at 50% opacity */
--assistant-bubble: rgba(240, 253, 244, 0.5);   /* Green tint: green.50 at 50% opacity */

/* Dark mode backgrounds */  
--user-bubble: rgba(88, 28, 135, 0.75);         /* Purple tint: purple.900 at 75% opacity */
--assistant-bubble: rgba(21, 128, 61, 0.75);    /* Green tint: green.800 at 75% opacity */
```

## Calculation Rules for Color Changes

To change the primary color system, follow these mapping rules:

### 1. Primary Color Selection
Choose any Tailwind color family (e.g., `blue`, `red`, `indigo`, `cyan`, `amber`, etc.)

### 2. Complementary Color Selection  
Use color theory to select complementary color:

| Primary Color | Recommended Complementary |
|---------------|---------------------------|
| `purple`      | `green`                   |
| `blue`        | `orange`                  |
| `red`         | `green` or `cyan`         |
| `green`       | `red` or `purple`         |
| `orange`      | `blue` or `cyan`          |
| `yellow`      | `purple` or `indigo`      |
| `cyan`        | `red` or `orange`         |
| `indigo`      | `yellow` or `amber`       |

### 3. Shade Mapping
- **Light mode**: Use `[color].500` for primary elements
- **Dark mode**: Use `[color].600` for primary elements  
- **Complementary**: Always use `[complementary].500`

### 4. Background Tint Calculation
- **Light mode**: Use `[color].50` color values at 50% opacity
- **Dark mode**: Use `[color].800-900` color values at 75% opacity

## Implementation Example

To change from purple/green to blue/orange:

```css
/* Light mode */
:root {
  --primary: theme('colors.blue.500');
  --accent: theme('colors.blue.500');
  --sidebar-accent: theme('colors.blue.500');
  --user-bubble-border: var(--accent);
  --user-bubble: rgba(239, 246, 255, 0.5);        /* blue.50 at 50% */
  
  --assistant-bubble-border: theme('colors.orange.500');
  --assistant-bubble: rgba(255, 247, 237, 0.5);   /* orange.50 at 50% */
}

/* Dark mode */
.dark {
  --primary: theme('colors.blue.600');
  --accent: theme('colors.blue.600');
  --sidebar-accent: theme('colors.blue.600');
  --user-bubble: rgba(30, 64, 175, 0.75);         /* blue.800 at 75% */
  
  --assistant-bubble-border: theme('colors.orange.500');
  --assistant-bubble: rgba(154, 52, 18, 0.75);    /* orange.800 at 75% */
}
```

## Files to Update

When changing colors, update these files:

1. **`apps/web/src/index.css`** - Main color variable definitions
2. **`apps/web/tailwind.config.js`** - Tailwind theme extensions (if needed)
3. **`apps/web/src/components/thread/site-menu/settings-drawer.tsx`** - Default color picker value

## Color Accessibility

Ensure color combinations meet WCAG AA contrast requirements:
- Text on backgrounds: minimum 4.5:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio
- Test with tools like WebAIM Contrast Checker

## Testing Color Changes

After changing colors:
1. Test both light and dark modes
2. Verify message bubble readability
3. Check button and interactive element contrast
4. Ensure color picker functionality works
5. Test with color blindness simulators