# Best Practices for Interactive Components in Astro

When building interactive components for Astro (using frameworks like Svelte, React, Vue, etc.), there are specific challenges related to how Astro handles hydration. This document outlines best practices to avoid common pitfalls, particularly regarding DOM IDs and hydration.

## The "Double Render" Problem

Astro renders your component twice:

1.  **Server-Side Rendering (SSR)**: Generates the static HTML sent to the browser.
2.  **Client-Side Hydration**: The JavaScript framework boots up in the browser and "claims" the existing HTML to make it interactive.

If you use the same component multiple times on a page (e.g., once for a static preview and once for an interactive demo), or if you use hardcoded IDs, you will end up with duplicate IDs in the DOM.

### The Symptom

- **Duplicate IDs**: `[DOM] Found 2 elements with non-unique id #my-input`
- **Hydration Errors**: Frameworks like Svelte 5 may fail to hydrate correctly if they encounter duplicate IDs.
  - Error: `TypeError: Cannot read properties of undefined (reading 'call')` (Svelte 5 specific)
  - Behavior: The component renders but is non-interactive. Event listeners may be attached to the wrong element (e.g., the static SSR version instead of the interactive one).

### The Solution: Unique IDs

**Never hardcode DOM IDs** in reusable components. Always generate a unique identifier for each instance of the component.

#### Bad Pattern

```svelte
<!-- Component.svelte -->
<script>
  let value = 0;
</script>

<label for="my-input">Value: {value}</label>
<input id="my-input" type="range" bind:value />
```

If this component is used twice on a page, you will have two inputs with `id="my-input"`.

#### Good Pattern (Svelte)

Generate a unique ID when the component initializes.

```svelte
<!-- Component.svelte -->
<script>
  // Generate a unique ID
  // crypto.randomUUID() works in Node.js (SSR) and Browsers
  const uid = crypto.randomUUID();
</script>

<label for="input-{uid}">Value: {value}</label>
<input id="input-{uid}" type="range" bind:value />
```

### Why not `window.crypto`?

You might be tempted to use `window.crypto.randomUUID()`. However, **`window` is not available during Server-Side Rendering (SSR)**. Accessing it will cause your build to fail or throw errors on the server.

Since this project uses Node 24, the `crypto` global is available in both the server (Node.js) and client (Browser) environments, so you can call `crypto.randomUUID()` directly.

If you need to support older environments, `Math.random().toString(36).slice(2)` is a sufficient fallback for UI IDs.

## Hydration Mismatches

Ensure that the HTML generated on the server matches exactly what the client expects.

- **Avoid `window` checks for rendering**: If you render something different based on `if (typeof window !== 'undefined')`, the server HTML will differ from the client's initial render, causing hydration mismatches.
- **Use `client:only` sparingly**: Only use `client:only` if the component strictly cannot run on the server (e.g., it relies entirely on browser APIs like `localStorage` or `canvas` immediately on mount). Prefer `client:load` or `client:visible` with proper SSR fallbacks.

## Debugging Hydration Issues

If you suspect a hydration issue:

1.  **Check the Console**: Look for "Hydration failed" warnings or duplicate ID errors.
2.  **Disable JavaScript**: Does the content look correct without JS? If not, your SSR logic might be flawed.
3.  **Isolate**: Create a minimal reproduction page with just that component.
4.  **Headless Testing**: Use tools like Playwright to automate checks for console errors and interactivity (see [Playwright Headless Setup](./playwright-headless-setup.md)).

## Starlight Style Isolation

When embedding custom components into Starlight documentation pages (MDX), you will encounter style conflicts. Starlight applies aggressive typography and spacing rules (like `margin-top` on all elements) to the main content area (`.sl-markdown-content`).

### The Symptom

- **Broken Grids**: Grid items get pushed down or misaligned because of inherited margins.
- **Unexpected Typography**: Headings or text inside your component look like documentation text instead of UI.

### The Solution: `.not-content`

Starlight provides a utility class called `.not-content`. Elements with this class are excluded from the global prose styles.

**Always wrap complex UI components in the `<Diagram>` component.**

The `<Diagram>` component is a simple wrapper that applies `.not-content` for you.

#### Bad Pattern

```mdx
import MyComponent from "../../components/MyComponent.svelte";

Here is my component:

<MyComponent />
```

#### Good Pattern

```mdx
import Diagram from "../../components/Diagram.svelte";
import MyComponent from "../../components/MyComponent.svelte";

Here is my component:

<Diagram>
  <MyComponent />
</Diagram>
```

This ensures your component renders exactly as you designed it, without fighting against the documentation theme.
