# Axiomatic Color: Vercel Demo

A live demonstration of Axiomatic Color's **runtime solver** using Vite + React. This isn't just a theme—it's a physics engine that runs in your browser, automatically solving for APCA-compliant contrast, gamut safety, and dark mode adaptation in real-time.

## Quick Start

```bash
# From the monorepo root
pnpm install

# Run the demo
cd examples/vercel-demo
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## What It Demonstrates

### Runtime Solver (Zero Build Step)

The entire color system is computed **in the browser** when you change the brand color. No build tools, no preprocessors—just pure JavaScript running the constraint solver and generating CSS custom properties on the fly.

### APCA-Compliant Contrast

Every text-on-background pair automatically meets [APCA](https://github.com/Myndex/SAPC-APCA) contrast requirements. The solver uses perceptual contrast math (not WCAG 2.x ratios) to ensure readable text across all surfaces.

### Automatic Dark Mode

Click the theme toggle (☀️/🌙). The solver doesn't just invert colors—it **re-solves** the entire system for dark mode polarity anchors, preserving contrast relationships and hue identity.

### Gamut Safety

Try the "Tricky Yellow" preset. Yellows are notoriously hard to make readable (especially in dark mode). The solver automatically reduces chroma or shifts lightness to keep colors within the P3 gamut and above contrast thresholds.

## How It Works

### 1. Dynamic Configuration

[src/vercel-config.ts](src/vercel-config.ts) merges the base config with the user's brand color:

```ts
export function createVercelConfig(brandColor: string): SolverConfig {
  return {
    ...demoConfig,
    anchors: {
      ...demoConfig.anchors,
      keyColors: {
        ...demoConfig.anchors.keyColors,
        brand: brandColor, // ← Dynamic!
      },
    },
  };
}
```

### 2. Solver Execution

[src/App.tsx](src/App.tsx) runs the solver **synchronously** in a `useMemo` hook whenever the brand color changes:

```tsx
const config = useMemo(() => createVercelConfig(brandColor), [brandColor]);

const tokensCss = useMemo(() => {
  const theme = solve(config);
  return generateTokensCss(config.groups, theme, config.borderTargets, {
    selector: ":root",
    prefix: "axm",
  });
}, [config]);
```

### 3. CSS Injection

The generated CSS is injected into the DOM via a `<style>` tag:

```tsx
<style id="dynamic-theme">{tokensCss}</style>
```

This creates CSS custom properties like:

```css
:root {
  --axm-color-page: oklch(98% 0.01 260);
  --axm-color-card: oklch(96% 0.02 260);
  --axm-color-action: oklch(58% 0.18 260);
  /* ... */
}
```

### 4. Theme State Management

`AxiomaticTheme` manages light/dark mode state globally. The component subscribes to changes:

```tsx
useEffect(() => {
  return AxiomaticTheme.get().subscribe((state) => {
    setIsDark(state.tau === -1);
  });
}, []);
```

Clicking the theme toggle calls `AxiomaticTheme.get().toggle()`, which updates `tau` (the theme interpolation parameter) and re-renders with new solved colors.

## File Structure

```
vercel-demo/
├── color-config.json          # Full config: surfaces, groups, anchors
├── vite.config.ts             # Standard Vite + React setup
├── package.json               # Uses workspace:* for @axiomatic-design/color
├── src/
│   ├── main.tsx               # Entry point, imports engine.css
│   ├── App.tsx                # Core demo: color picker + solver integration
│   ├── vercel-config.ts       # Factory function for dynamic config
│   └── index.css              # Utility classes (NOT Tailwind, hand-rolled)
└── public/                    # Fonts (Geist Sans/Mono)
```

## Customization

### Change the Default Brand Color

Edit `color-config.json`:

```json
{
  "anchors": {
    "keyColors": {
      "brand": "#ff6b6b"
    }
  }
}
```

### Add a New Surface

Add to the `surfaces` array in `color-config.json`:

```json
{
  "slug": "alert",
  "label": "Alert Banner",
  "polarity": "inverted",
  "hue": "danger",
  "targetChroma": 0.12
}
```

Then use it in App.tsx:

```tsx
<div className="surface-alert bordered p-4 rounded">
  Warning: Something went wrong!
</div>
```

### Modify Contrast Targets

The solver uses APCA thresholds defined in the engine. To adjust (not recommended unless you know what you're doing), see the [main documentation](https://axiomatic-color.dev) for `contrastTargets` config.

## Debugging

The demo includes `<axiomatic-debugger />`, a custom element that provides a visual inspector for the solved color system. It shows:

- All surfaces with their computed colors
- Contrast ratios (APCA Lc values)
- Gamut clipping diagnostics
- Light/dark mode comparison

To open it, look for the debugger UI in the bottom-right corner.

## Learn More

- **Main Docs**: [https://axiomatic-color.dev](https://axiomatic-color.dev)
- **APCA Contrast**: [https://github.com/Myndex/SAPC-APCA](https://github.com/Myndex/SAPC-APCA)
- **OKLCh Color Space**: [https://oklch.com](https://oklch.com)

## Key Takeaways

1. **No Build Step for Theme Changes**: The solver runs at runtime, making it ideal for user-customizable themes or design tools.
2. **Accessible by Default**: APCA contrast guarantees readability without manual audits.
3. **Dark Mode Just Works**: The solver re-computes colors for dark polarity—no hacky `filter: invert()` tricks.
4. **Gamut-Aware**: Colors stay within displayable ranges, even for tricky hues like yellow or cyan.
