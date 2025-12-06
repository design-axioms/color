# @axiomatic-design/eslint-plugin

ESLint plugin for the Axiomatic Color System. This plugin helps enforce the "Code is Truth" axiom by flagging hardcoded colors and ensuring semantic token usage.

## Installation

```bash
pnpm add -D @axiomatic-design/eslint-plugin
```

## Configuration

Add the plugin to your `eslint.config.js` (flat config):

```javascript
import axiomatic from "@axiomatic-design/eslint-plugin";

export default [
  {
    plugins: {
      "@axiomatic-design": axiomatic,
    },
    rules: {
      "@axiomatic-design/no-hardcoded-colors": "warn",
      "@axiomatic-design/no-raw-tokens": "error",
    },
  },
];
```

## Rules

### `no-hardcoded-colors`

Flags usage of hardcoded color values (Hex, RGB, HSL, named colors) in your code.

**Invalid:**

```jsx
<div style={{ color: "#ff0000" }}>Error</div>
<div style={{ backgroundColor: "rgb(0, 0, 0)" }}>Black</div>
```

**Valid:**

```jsx
<div style={{ color: "var(--axm-text-high-token)" }}>Error</div>
<div className="surface-card">Card</div>
```

**Auto-Fix:**
The rule provides auto-fix suggestions to replace hardcoded colors with the closest matching semantic token from your generated theme.

### `no-raw-tokens`

Flags usage of internal tokens, non-existent tokens, or tokens that should be applied via utility classes.

**Invalid:**

```javascript
// Internal token
const color = "var(--scale-gray-500)";

// Non-existent token
const color = "var(--axm-does-not-exist)";

// Surface token (should use class)
const bg = "var(--surface-card)";

// Token with utility class
const shadow = "var(--axm-shadow-sm)";
```

**Valid:**

```javascript
// Semantic token
const color = "var(--axm-text-high-token)";

// Utility class usage (in className)
<div className="surface-card shadow-sm" />;
```

## Config Awareness

The plugin automatically detects your `color-config.json` and generated CSS files (`css/theme.css`, `css/utilities.css`) to validate tokens and provide accurate suggestions. Ensure these files are present in your project root or build output.
