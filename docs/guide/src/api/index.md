# API Reference

The Color System API is divided into three parts based on where you use them.

## 1. Build Pipeline
Tools for generating static CSS tokens as part of your build process.
- **[CLI](../usage/cli.md)**: The command-line interface for generating themes.
- **[Generator API](./generator.md)**: Node.js API for generating CSS strings programmatically.

## 2. Universal API
Core logic that can be used in both Node.js (build time) and the browser (runtime).
- **[Solver API](./solver.md)**: The math engine that calculates accessible colors.

## 3. Runtime Control
Tools for managing the theme in the browser.
- **[Runtime API](./runtime.md)**: The JavaScript controller (`ThemeManager`) and CSS Engine for dynamic theming.
