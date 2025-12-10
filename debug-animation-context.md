# Debugging Reactive Color Animation

## Context

We are building "Axiomatic Color", a system where colors are derived mathematically from a few core variables using CSS `calc()` and `oklch()`.
The core state variable is `--tau` (Time), which represents the theme mode.

- `--tau: 1` = Light Mode
- `--tau: -1` = Dark Mode

We want to animate `--tau` smoothly between 1 and -1 when the theme toggles.
This should cause all derived colors (like charts) to interpolate smoothly.

## The Problem

When toggling the theme (via `data-theme` attribute on `html`), the chart colors "snap" instantly to the new value instead of transitioning, even though we have `transition: --tau 0.3s` on the root.

## The Architecture

### 1. The Engine (`css/engine.css`)

Defines `--tau` as a registered custom property (`@property`) so it _can_ be interpolated.

```css
/* css/engine.css */
@property --tau {
  syntax: "<number>";
  initial-value: 1;
  inherits: true;
}

:root {
  --tau: 1;
  transition: --tau 0.3s ease-in-out;
}
```

### 2. The Chart Algebra (`src/lib/charts.ts`)

Generates CSS variables that depend on `--tau`. The formula is roughly:
`L = L_mid - (k * tau)`

```typescript
/* src/lib/charts.ts */
const css = `  ${v(`chart-${index}`)}: oklch(
  calc(${l_mid} - (${k} * var(--tau)))
  calc(var(${v(`chart-${index}-c`)}) + (var(--alpha-beta) * 0.5))
  var(${v(`chart-${index}-h`)})
);`;
```

### 3. The Component (`site/src/components/DataVizDemo.svelte`)

Uses these variables directly in `style`.

```svelte
<!-- site/src/components/DataVizDemo.svelte -->
<div style="background-color: var(--axm-chart-{i}); ..."></div>
```

### 4. The Overrides (`site/src/styles/starlight-custom.css`)

Attempts to force the transition, fighting against the Starlight framework which might be resetting things.

```css
/* site/src/styles/starlight-custom.css */
html,
html[data-theme],
:root[data-theme] {
  transition: --tau 0.3s ease-in-out !important;
}
```

## What We've Tried

1.  Adding `transition: background-color` to the chart elements. (Caused conflict/fighting).
2.  Adding `transition: --tau` to `:root`.
3.  Adding `transition: --tau` to `html` with `!important`.
4.  Verifying via JS that `--tau` _is_ interpolating in the computed style (it seems to be).

## The Question

Why does the visual result "snap"?

1.  Is there a browser limitation with `calc()` derived values inside `oklch()` not updating frame-by-frame when the dependency (`--tau`) animates?
2.  Is Starlight (the documentation framework) doing something destructive to the DOM (like a View Transition or full re-render) that bypasses our CSS transition?
3.  Is the `data-theme` attribute change happening in a way that prevents the transition from triggering (e.g. `display: none` intermediate state)?

Please analyze the mechanism and propose a robust fix.
