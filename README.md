# Automated Color System

**Platform-native, adaptive color system with APCA-driven accessibility.**

## Features

|                     |                                                                   |
| ------------------- | ----------------------------------------------------------------- |
| Automated Contrast  | APCA algorithm ensures readability across all surfaces            |
| Smooth Transitions  | Theme changes animate seamlessly via `@property` + `light-dark()` |
| Platform-Native     | Automatic High Contrast mode support                              |
| 7 Semantic Surfaces | Page, Card, Action, Spotlight, Sidebar, Overlay, Popover          |
| 6 Hue Modifiers     | Monochrome, Brand, Blue, Success, Warning, Error                  |
| Fully Tested        | 33 unit tests with 91% coverage on core math utilities            |

## Quick Start

### 1. Understand the Mental Model

Before diving in, read **[System Intuition](./docs/intuition.md)**. It explains why this system uses "Surfaces" instead of colors and how the "Reactive Pipeline" works.

### 2. Run the Demo

The best way to learn is to play with the interactive lab.

```bash
# Install dependencies
pnpm install

# Generate CSS tokens (The Solver)
pnpm solve

# Run the Experience Lab
cd demo && pnpm dev
```

### 3. Use it in your project

Import the core files and start using semantic classes.

```css
@import "./css/engine.css";
@import "./css/utilities.css";
@import "./css/theme.css";
```

```html
<div class="surface-card bordered">
  <h1 class="text-strong">Hello World</h1>
  <button class="surface-action">Click Me</button>
</div>
```

## Installation & Consumption

To use the system in your project, import the three core CSS files:

1. **`engine.css`**: The core reactive pipeline (must be imported first).
2. **`utilities.css`**: The standard API for surfaces and text.
3. **`theme.css`**: The generated tokens (or your custom theme).

```css
@import "./css/engine.css";
@import "./css/utilities.css";
@import "./css/theme.css";
```

## Customization

You can generate a custom theme by modifying `scripts/surface-lightness.config.json` and running:

```bash
pnpm solve
```

This will regenerate `css/theme.css` with your new configuration.

## Runtime API

For dynamic theming or scoped applications, you can use the runtime API to generate and inject themes on the fly.

```typescript
import { generateTheme, injectTheme } from "./src/lib/runtime";
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

## Development

```bash
pnpm test          # Run unit tests
pnpm test:ui       # Open Vitest UI
pnpm test:coverage # Generate coverage report
pnpm lint          # Check code quality
pnpm lint:fix      # Auto-fix lint errors
pnpm solve         # Regenerate CSS tokens
```

### Environment

- **Runtime**: Node.js v24+ (Required for native TypeScript support)
- **Package Manager**: pnpm

### Running Scripts

This project uses Node.js 24's native TypeScript support. Run scripts directly with `node`:

```bash
node scripts/generate-tokens.ts
```

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
├── scripts/
│   └── surface-lightness.config.json  # Surface definitions
├── css/
│   ├── engine.css               # Core reactive pipeline
│   ├── utilities.css            # Surface/text utility classes
│   └── theme.css                # Generated tokens (do not edit)
└── demo/                        # React demo application
```

## Performance

- **Build Time**: ~0.4s to solve and generate all tokens
- **Test Suite**: 33 tests pass in ~10ms
- **Coverage**: 91% on core math utilities (exceeds 80% target)
