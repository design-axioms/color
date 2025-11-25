# Framework Integration

The Color System is framework-agnostic because it outputs standard CSS. However, you can easily integrate it with your favorite tools.

## React

Since the system uses standard CSS classes, you can use them directly in your JSX.

```tsx
function Card({ children }) {
  return (
    <div className="surface-card p-4 rounded-lg">
      <h2 className="text-strong text-xl">Title</h2>
      <p className="text-subtle">{children}</p>
    </div>
  );
}
```

### Dynamic Theming

To change the theme dynamically (e.g., user-selected brand color), you can use the `runtime` module.

```tsx
import { useEffect } from "react";
import { injectTheme, generateTheme } from "color-system/runtime";

function ThemeProvider({ brandColor }) {
  useEffect(() => {
    const css = generateTheme({
      keyColors: { brand: brandColor },
    });
    const style = injectTheme(css);
    return () => style.remove();
  }, [brandColor]);

  return <slot />;
}
```

## Tailwind CSS

You can configure Tailwind to use the system's CSS variables.

```js
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      // Map Tailwind utilities to System variables
      surface: {
        page: "var(--computed-surface-page)",
        card: "var(--computed-surface-card)",
      },
      text: {
        strong: "var(--computed-text-strong)",
        subtle: "var(--computed-text-subtle)",
      },
    },
  },
};
```

> **Note:** We are working on a dedicated Tailwind plugin to automate this mapping.
