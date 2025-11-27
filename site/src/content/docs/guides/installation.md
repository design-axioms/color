---
title: Installation
description: How to install and configure the Algebraic Color System CLI.
---

The Algebraic Color System is distributed as a CLI tool that generates a static CSS file. This ensures zero runtime overhead in your application.

## Prerequisites

-   **Node.js**: v18 or higher.
-   **Package Manager**: npm, pnpm, or yarn.

## 1. Install the CLI

You can install the package globally or as a dev dependency in your project.

```bash
# Install as a dev dependency (Recommended)
npm install -D @algebraic/color-system

# Or using pnpm
pnpm add -D @algebraic/color-system
```

## 2. Initialize the Configuration

Run the `init` command to create a default configuration file in your project root.

```bash
npx color-system init
```

This will create a `color-config.json` file. This file contains your **Anchors**, **Key Colors**, and **Surface Definitions**.

```json
// color-config.json (Simplified)
{
  "anchors": { ... },
  "colors": {
    "brand": 260,
    "success": 150
  },
  "themes": ["light", "dark"]
}
```

## 3. Build the Theme

Run the `build` command to generate your CSS.

```bash
npx color-system build
```

By default, this will create a `theme.css` file in your current directory. You can specify an output path:

```bash
npx color-system build --out ./src/styles/theme.css
```

## 4. Add Scripts (Optional)

For convenience, add these commands to your `package.json`:

```json
{
  "scripts": {
    "theme:build": "color-system build --out ./src/styles/theme.css",
    "theme:watch": "color-system build --out ./src/styles/theme.css --watch"
  }
}
```

## What's Next?

Now that you have a `theme.css` file, you need to integrate it into your application.

-   **[Integration Guide](./integration)**: Learn how to load the CSS and start using surfaces.
-   **[The Theme Builder](./theme-builder)**: Learn how to visually customize your `color-config.json`.
