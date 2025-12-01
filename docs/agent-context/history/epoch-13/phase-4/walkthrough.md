# Walkthrough - Epoch 13 Phase 4: Advanced Customization

## Overview
This phase focused on removing friction for advanced users by adding configuration flexibility, validation tools, and manual override capabilities.

## Key Changes

### 1. Configuration Options (`prefix` & `selector`)
We added an `options` object to the `SolverConfig` schema:
```typescript
export interface ConfigOptions {
  prefix?: string;   // Default: "color-sys"
  selector?: string; // Default: ":root"
}
```
- **CSS Generation**: The `generateTokensCss` function now respects these options.
- **TypeScript Exporter**: Generated TypeScript tokens now use the custom prefix.
- **Runtime**: The `generateTheme` runtime function accepts these options to scope styles dynamically.

### 2. Audit Command
We introduced a new CLI command: `color-system audit`.
- **Usage**: `color-system audit --config color-config.json`
- **Checks**:
  - **Contrast**: Warns if high-emphasis text contrast is below APCA 60.
  - **Polarity**: Warns if a 'page' surface is too dark in light mode (or vice versa), and similarly for 'inverted' surfaces.
- **Implementation**: The command solves the theme and analyzes the resulting lightness values against the anchors and polarity rules.

### 3. Theme Builder Overrides
We added the ability to manually override surface colors in the Theme Builder.
- **Schema**: `SurfaceConfig` now supports an `override` property:
  ```typescript
  override?: {
    light?: string; // Hex
    dark?: string;  // Hex
  }
  ```
- **Solver**: The `solve` function checks for overrides and uses the provided color (converted to OKLCH) instead of the calculated contrast-based color.
- **UI**: The Theme Builder now includes color pickers for Light and Dark mode overrides within the surface expansion panel. A warning icon (⚠️) appears when overrides are active.

## Verification
- **Config Options**: Verified by generating CSS with custom prefixes and selectors.
- **Audit Command**: Verified using a test configuration with intentionally bad anchors to trigger contrast and polarity warnings.
- **Overrides**: Verified using a script to confirm that the solver respects manual hex values.

## Next Steps
With the core system now robust and flexible, we can focus on documentation and polishing the developer experience in the next phase.
