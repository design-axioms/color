# @axiomatic-design/color

**An Axiomatic approach to color. Automated contrast, platform-native adaptation, and mathematically guaranteed accessibility.**

## Features

|                     |                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Automated Contrast  | APCA algorithm ensures readability across all surfaces                                                                 |
| Smooth Transitions  | Theme changes stay continuous via `@property` + transitioned computed colors (with `light-dark()` selecting endpoints) |
| Platform-Native     | Automatic High Contrast mode support                                                                                   |
| 7 Semantic Surfaces | Page, Card, Action, Spotlight, Sidebar, Overlay, Popover                                                               |
| 6 Hue Modifiers     | Monochrome, Brand, Blue, Success, Warning, Error                                                                       |
| Fully Tested        | 33 unit tests with 91% coverage on core math utilities                                                                 |

## Installation

```bash
npm install @axiomatic-design/color
# or
pnpm add @axiomatic-design/color
# or
yarn add @axiomatic-design/color
```

## Quick Start

### 1. Initialize Configuration

Run the init command to scaffold a configuration file and default theme.

```bash
pnpm exec axiomatic init
```

This creates a `color-config.json` in your project root.

### 2. Generate CSS

Add a script to your `package.json` to generate your theme tokens.

```json
{
  "scripts": {
    "theme": "axiomatic"
  }
}
```

Run the solver:

```bash
npm run theme
```

This generates a `theme.css` file (by default).

### 3. Import CSS

Import the core engine, utilities, and your generated theme into your application.

```css
/* In your main CSS file */
@import "@axiomatic-design/color/engine.css";
@import "./theme.css"; /* Your generated theme */

/* Optional utilities */
@import "@axiomatic-design/color/utilities.css";
```

### 4. Use Semantic Classes

```html
<div class="surface-card bordered">
  <h1 class="text-strong">Hello World</h1>
  <button class="surface-action">Click Me</button>
</div>
```

## CLI Usage

The `axiomatic` CLI is the primary tool for generating your theme.

```bash
# Initialize a new config
pnpm exec axiomatic init

# Generate theme from default config (color-config.json) to default output (theme.css)
pnpm exec axiomatic

# Generate theme with custom paths
pnpm exec axiomatic ./my-config.json ./dist/my-theme.css
```

## Runtime API

For dynamic theming or scoped applications, you can use the runtime API to generate and inject themes on the fly.

```typescript
import { generateTheme, injectTheme } from "@axiomatic-design/color/runtime";
import { config } from "./my-config";

// Generate CSS for a specific scope
const css = generateTheme(config, "#my-app");

// Inject it into the page
injectTheme(css);
```

## Architecture

The system consists of three main components:

- **Solver**: Calculates precise lightness values to hit APCA contrast targets
- **CSS Pipeline**: Transforms tokens with hue/chroma via relative color syntax
- **Demo App**: Comprehensive showcase + interactive testing lab

### How It Works

1. **Config**: Define semantic surfaces with polarity and contrast requirements
2. **Solve**: Algorithm calculates optimal lightness values using binary search
3. **Generate**: CSS custom properties are written with `light-dark()` functions
4. **Apply**: Surfaces automatically adapt to system theme preferences

See [System Intuition](./docs/intuition.md) for the mental model, and [solver-architecture.md](./docs/solver-architecture.md) for technical details.

### CSS Inspector

The library includes a robust CSS Inspector for debugging style resolution, supporting modern features like `@scope`, `@layer`, and complex specificity.

See [Inspector Architecture](./src/lib/inspector/ARCHITECTURE.md) for details.

## Development

If you want to contribute to the library itself:

```bash
pnpm install
pnpm test          # Run unit tests
pnpm build         # Build the package
pnpm solve         # Regenerate internal CSS tokens
```

### Documentation & Demo

To run the unified development server (Docs + Demo):

```bash
pnpm dev:site
```

This starts a proxy at `http://localhost:3000` where:

- `/` serves the Documentation
- `/demo/` serves the Theme Builder

### Environment

- **Runtime**: Node.js v24+ (Required for native TypeScript support)
- **Package Manager**: pnpm

## Project Structure

```
color-system/
├── src/
│   ├── lib/
│   │   ├── math.ts              # Core APCA & binary search utilities
│   │   ├── generator.ts         # CSS token generation
│   │   ├── index.ts             # Surface solving algorithm
│   │   ├── runtime.ts           # Runtime theme generation
│   │   └── __tests__/           # Unit tests
│   └── cli/
│       └── index.ts             # Main CLI entry point
├── css/
│   ├── engine.css               # Core reactive pipeline
│   ├── utilities.css            # Surface/text utility classes
│   └── theme.css                # Generated tokens (do not edit)
└── demo/                        # React demo application
```
