---
title: UI Primitives
---

The Color System provides essential UI primitives that adapt to the current theme context.

## Elevation (Shadows)

Shadows provide depth and hierarchy. The system generates a semantic scale of shadows that are subtle in Light Mode and stronger in Dark Mode to ensure visibility.

<div class="surface-card bordered" style="padding: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2rem;">
  <div class="surface-card shadow-sm bordered" style="height: 100px; display: flex; align-items: center; justify-content: center;">shadow-sm</div>
  <div class="surface-card shadow-md bordered" style="height: 100px; display: flex; align-items: center; justify-content: center;">shadow-md</div>
  <div class="surface-card shadow-lg bordered" style="height: 100px; display: flex; align-items: center; justify-content: center;">shadow-lg</div>
  <div class="surface-card shadow-xl bordered" style="height: 100px; display: flex; align-items: center; justify-content: center;">shadow-xl</div>
</div>

### Usage

Use the utility classes or CSS variables:

```css
.my-card {
  box-shadow: var(--shadow-md);
}
/* OR */
<div class="shadow-md">...</div>
```

## Focus Indicators

Accessible focus indicators are critical for keyboard navigation. The system provides a universal focus ring that adapts to the brand color and ensures contrast.

<div class="surface-card bordered" style="padding: 2rem; display: flex; gap: 1rem;">
  <button class="surface-action focus-ring" style="padding: 0.5rem 1rem; border: none; border-radius: 4px;">Focus Me</button>
  <input class="surface-workspace focus-ring bordered" placeholder="Focus Me" style="padding: 0.5rem; border-radius: 4px;">
</div>

### Usage

Apply the `.focus-ring` utility class to interactive elements. It applies styles on `:focus-visible`.

```html
<button class="surface-action focus-ring">Click Me</button>
```

The focus ring uses the `--focus-ring-color` variable, which is derived from your brand hue.

```css
:root {
  --focus-ring-color: ...; /* Auto-generated */
}
```