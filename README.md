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

```bash
# Install dependencies
pnpm install

# Generate CSS tokens
pnpm solve

# Run demo app
cd demo && pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint
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

See [concepts.md](./concepts.md) and [solver-architecture.md](./solver-architecture.md) for detailed documentation.

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
├── scripts/
│   ├── solver/
│   │   ├── math.ts              # Core APCA & binary search utilities
│   │   ├── generator.ts         # CSS token generation
│   │   ├── index.ts             # Surface solving algorithm
│   │   └── __tests__/           # Unit tests
│   ├── generate-tokens.ts       # Main CLI entry point
│   └── surface-lightness.config.json  # Surface definitions
├── css/
│   ├── generated-tokens.css     # Auto-generated tokens (do not edit)
│   ├── base.css                 # Base styles & transitions
│   └── utilities.css            # Surface/text utility classes
└── demo/                        # React demo application
```

## Performance

- **Build Time**: ~0.4s to solve and generate all tokens
- **Test Suite**: 33 tests pass in ~10ms
- **Coverage**: 91% on core math utilities (exceeds 80% target)
