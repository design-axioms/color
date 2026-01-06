# RFC-CONFIGURATION: Configuration System Architecture

**Status**: Draft  
**Date**: 2026-01-05  
**Sources**:

- `color-config.json` (main configuration)
- `color-config.schema.json` (JSON Schema definition)
- `src/lib/types.ts` (TypeScript type definitions)
- `src/lib/resolve.ts` (config resolution logic)
- `src/lib/defaults.ts` (default configuration)
- `src/cli/commands/audit.ts` (validation logic)

---

## Summary

This RFC documents the **Axiomatic Color Configuration System** — the declarative interface through which users define their design system's color behavior. The configuration schema specifies anchors (light/dark endpoints), surfaces (semantic UI elements), atmosphere parameters, chart palettes, and extension points.

The configuration is validated against a JSON Schema, resolved through a three-layer merge (defaults → vibe → user), and consumed by the solver to generate CSS, DTCG tokens, and other exports.

---

## Motivation

The configuration system is the **primary user-facing API** for Axiomatic Color. Understanding its structure, validation rules, and resolution behavior is essential for:

1. **User Documentation** - Helping users author valid configurations
2. **Tooling Development** - Building IDE extensions, validators, and generators
3. **Integration** - Connecting the system to design tools (Figma, Tokens Studio)
4. **Maintenance** - Ensuring schema changes are backward-compatible and well-documented

---

## Configuration Schema

The configuration format is defined in `color-config.schema.json` (JSON Schema Draft-07) and `src/lib/types.ts` (TypeScript type definitions).

### Top-Level Structure

```typescript
export type UserConfig = DeepPartial<SolverConfig> & { $schema?: string };

export type SolverConfig = {
  vibe?: VibeName;
  anchors: PolarityAnchors;
  groups: SurfaceGroup[];
  hueShift?: HueShiftConfig;
  borderTargets?: BorderTargets;
  palette?: PaletteConfig;
  presets?: PresetsConfig;
  options?: ConfigOptions;
};
```

**Key Properties:**

| Field           | Type              | Required | Description                                                                    |
| :-------------- | :---------------- | :------- | :----------------------------------------------------------------------------- |
| `$schema`       | `string`          | No       | JSON Schema reference for IDE support                                          |
| `vibe`          | `VibeName`        | No       | Preset configuration name (e.g., `"academic"`, `"vibrant"`)                    |
| `anchors`       | `PolarityAnchors` | Yes\*    | Defines light/dark endpoints for page and inverted polarities, plus key colors |
| `groups`        | `SurfaceGroup[]`  | Yes\*    | Ordered list of surface groups defining the UI hierarchy                       |
| `hueShift`      | `HueShiftConfig`  | No       | Controls hue rotation across the contrast scale                                |
| `borderTargets` | `BorderTargets`   | No       | Target contrast levels for decorative, interactive, and critical borders       |
| `palette`       | `PaletteConfig`   | No       | Configuration for chart/data visualization colors                              |
| `presets`       | `PresetsConfig`   | No       | Typography and other design preset configurations                              |
| `options`       | `ConfigOptions`   | No       | CSS variable prefix and selector customization                                 |

\*Required in resolved config; optional in user config due to defaults.

---

## Section 1: Anchors

Anchors define the **luminance endpoints** for the contrast scale in each mode and polarity, plus the system's **key colors**.

### Structure

```typescript
export interface PolarityAnchors {
  readonly page: Anchors;
  readonly inverted: Anchors;
  readonly keyColors: Record<string, string>;
}

export interface Anchors {
  readonly light: ModeAnchors;
  readonly dark: ModeAnchors;
}

export interface ModeAnchors {
  readonly start: AnchorValue;
  readonly end: AnchorValue;
}

export interface AnchorValue {
  readonly background: number; // 0.0 - 1.0 (OKLch Lightness)
  readonly adjustable?: boolean;
}
```

### Example

```json
{
  "anchors": {
    "page": {
      "light": {
        "start": { "background": 1.0 },
        "end": { "background": 0.9, "adjustable": true }
      },
      "dark": {
        "start": { "background": 0.1 },
        "end": { "background": 0.4, "adjustable": true }
      }
    },
    "inverted": {
      "light": {
        "start": { "background": 0.1, "adjustable": true },
        "end": { "background": 0 }
      },
      "dark": {
        "start": { "background": 0.9, "adjustable": true },
        "end": { "background": 1 }
      }
    },
    "keyColors": {
      "brand": "#8b5cf6",
      "gray": "#64748b",
      "success": "#10b981",
      "warning": "#f59e0b",
      "danger": "#ef4444"
    }
  }
}
```

### Key Colors

**Purpose**: Define semantic color identities used throughout the system.

**Format**:

- **Hex colors** (e.g., `"#8b5cf6"`)
- **Aliases** (e.g., `"indigo": "info"` references another key color)

**Special Keys**:

- `brand` - If present, used as the default hue for statistics calculations
- Other common keys: `success`, `warning`, `danger`, `info`

### Adjustable Anchors

The `adjustable` flag indicates that the anchor can be dynamically adjusted by the solver to accommodate surface requirements. This is used for the "middle" anchors to create spacing flexibility.

---

## Section 2: Groups and Surfaces

Groups organize surfaces into logical categories with optional spacing. Surfaces define the semantic UI elements (cards, buttons, etc.) and their behavior.

### Structure

```typescript
export type SurfaceGroup = {
  name: string;
  surfaces: SurfaceConfig[];
  gapBefore?: number; // Extra contrast steps before this group
};

export type SurfaceConfig = {
  slug: string;
  label: string;
  description?: string;
  polarity: Polarity; // "page" | "inverted"
  contrastOffset?: ContrastOffsets;
  override?: Partial<Record<Mode, string>>;
  targetChroma?: number;
  hue?: number | string;
  states?: StateDefinition[];
  computed?: Record<Mode, ModeSpec>; // Populated by solver
};
```

### Surface Properties

| Property         | Type                   | Required | Description                                                       |
| :--------------- | :--------------------- | :------- | :---------------------------------------------------------------- |
| `slug`           | `string`               | Yes      | Unique identifier (e.g., `"card"`, `"action"`)                    |
| `label`          | `string`               | Yes      | Human-readable name                                               |
| `description`    | `string`               | No       | Documentation string                                              |
| `polarity`       | `Polarity`             | Yes      | Which anchor set to use                                           |
| `contrastOffset` | `ContrastOffsets`      | No       | Shifts target contrast relative to sequence position              |
| `override`       | `Record<Mode, string>` | No       | Manual hex color overrides (bypasses solver)                      |
| `targetChroma`   | `number`               | No       | Desired chroma (0.0-0.3+); solver adjusts lightness for HK effect |
| `hue`            | `number \| string`     | No       | Target hue (0-360) or key color reference                         |
| `states`         | `StateDefinition[]`    | No       | Derived surfaces (hover, active, etc.)                            |

### States

States define derivative surfaces solved relative to a parent:

```typescript
export type StateDefinition = {
  name: string;
  offset: number; // Contrast offset relative to parent
};
```

**Example:**

```json
{
  "slug": "card",
  "label": "Card",
  "polarity": "page",
  "states": [
    { "name": "hover", "offset": 5 },
    { "name": "active", "offset": 8 }
  ]
}
```

This generates three surfaces: `card`, `card-hover`, `card-active`.

### Gap Before

The `gapBefore` property adds extra contrast separation between groups:

```json
{
  "name": "Spotlight",
  "gapBefore": 10,
  "surfaces": [...]
}
```

---

## Section 3: Atmosphere Settings

### Hue Shift

Controls progressive hue rotation across the contrast scale, creating "warm highlights" or "cool shadows" effects.

```typescript
export type HueShiftConfig = {
  curve: BezierCurve;
  maxRotation: number; // Degrees
};

export type BezierCurve = {
  p1: [number, number];
  p2: [number, number];
};
```

**Example:**

```json
{
  "hueShift": {
    "curve": { "p1": [0.5, 0], "p2": [0.5, 1] },
    "maxRotation": 5
  }
}
```

**Default**: `maxRotation: 5` (subtle effect)  
**Academic Vibe**: `maxRotation: 0` (minimal atmosphere)  
**Vibrant Vibe**: `maxRotation: 45` (dramatic shifts)

### Border Targets

Defines target APCA contrast values for three semantic border categories:

```typescript
export type BorderTargets = {
  decorative: number;
  interactive: number;
  critical: number;
};
```

**Example:**

```json
{
  "borderTargets": {
    "decorative": 10,
    "interactive": 30,
    "critical": 80
  }
}
```

---

## Section 4: Palette (Charts)

Configuration for data visualization colors.

```typescript
export interface PaletteConfig {
  targetChroma?: number;
  targetContrast?: number;
  hues?: number[];
}
```

| Property         | Type       | Default                                           | Description                           |
| :--------------- | :--------- | :------------------------------------------------ | :------------------------------------ |
| `targetChroma`   | `number`   | `0.14`                                            | Chroma for chart colors               |
| `targetContrast` | `number`   | `60`                                              | APCA contrast against page background |
| `hues`           | `number[]` | `[25, 190, 45, 250, 85, 280, 125, 320, 150, 360]` | Hue angles for categorical scale      |

---

## Section 5: Presets

Preset configurations for typography and other design primitives.

```typescript
export interface PresetsConfig {
  typography?: TypographyConfig;
}

export interface TypographyConfig {
  fonts?: Record<string, string>;
  weights?: Record<string, number>;
  sizes?: Record<string, string>;
  scale?: TypeScaleConfig;
}
```

---

## Section 6: Options

CSS generation customization.

```typescript
export interface ConfigOptions {
  prefix?: string;
  selector?: string;
}
```

| Property   | Type     | Default | Description                                      |
| :--------- | :------- | :------ | :----------------------------------------------- |
| `prefix`   | `string` | `"axm"` | CSS variable prefix (e.g., `--axm-surface-card`) |
| `selector` | `string` | `:root` | CSS selector for root variables                  |

---

## Validation

### Schema Validation

Configuration is validated against `color-config.schema.json` using **AJV** (JSON Schema validator).

**Validation Locations:**

1. **CLI (`audit` command)** - `src/cli/commands/audit.ts`
2. **Studio UI** - `site/src/lib/state/ConfigState.svelte.ts`

### Schema Key Handling

The `$schema` property is allowed in configuration files for IDE support but is **stripped before validation**.

### Error Reporting

Validation errors are formatted with path and message:

```
Schema Error: /anchors/keyColors must have required property 'brand'
Schema Error: /groups/0/surfaces/0/polarity must be equal to one of the allowed values
```

---

## Configuration Resolution

User configurations are **merged** with system defaults and optional vibe presets via `src/lib/resolve.ts`.

### Resolution Algorithm

```typescript
export function resolveConfig(userConfig: Partial<SolverConfig>): SolverConfig {
  // 1. Start with System Defaults
  let config = { ...DEFAULT_CONFIG };

  // 2. Apply Vibe Defaults (if selected)
  const vibeName = userConfig.vibe;
  if (vibeName) {
    const vibe = VIBES[vibeName];
    if (vibe) {
      config = deepMerge(config, vibe.config);
    }
  }

  // 3. Apply User Config
  config = deepMerge(config, userConfig);

  return config;
}
```

### Vibes

Vibes are **named preset configurations** defined in `src/lib/vibes.ts`:

| Vibe        | Description            | Key Characteristics                       |
| :---------- | :--------------------- | :---------------------------------------- |
| `default`   | Balanced, modern       | Empty config (pure defaults)              |
| `academic`  | Serious, high-contrast | Serif fonts, low chroma, linear scale     |
| `vibrant`   | Playful, high-chroma   | High chroma, aggressive hue shifts        |
| `corporate` | Trustworthy, stable    | Conservative atmosphere, standard spacing |

---

## Relationship to Solver and Exports

### Configuration → Solver → Theme

```
UserConfig (JSON)
  ↓ [resolveConfig()]
SolverConfig (Resolved)
  ↓ [solve()]
Theme (Solved)
  ↓ [generateTokensCss() / toDTCG() / toTailwind()]
CSS / DTCG / Tailwind
```

### Solver Entry Point

`src/lib/solver/index.ts`:

```typescript
export function solve(config: SolverConfig): Theme {
  // 1. Align inverted anchors with key colors
  // 2. Solve background sequences for each polarity/mode
  // 3. Apply hue shifts and chroma targets
  // 4. Solve chart colors
  // 5. Solve primitives (shadows, focus)
  return { surfaces, backgrounds, charts, primitives };
}
```

---

## Implementation Locations

| Concern              | File Path                                  | Description                   |
| :------------------- | :----------------------------------------- | :---------------------------- |
| **Type Definitions** | `src/lib/types.ts`                         | TypeScript interfaces         |
| **JSON Schema**      | `color-config.schema.json`                 | JSON Schema Draft-07          |
| **Defaults**         | `src/lib/defaults.ts`                      | `DEFAULT_CONFIG` constant     |
| **Resolution**       | `src/lib/resolve.ts`                       | `resolveConfig()` merge logic |
| **Vibes**            | `src/lib/vibes.ts`                         | Preset configurations         |
| **Validation (CLI)** | `src/cli/commands/audit.ts`                | Schema validation             |
| **Validation (UI)**  | `site/src/lib/state/ConfigState.svelte.ts` | Runtime validation            |
| **Solver**           | `src/lib/solver/index.ts`                  | `solve()` entry point         |
| **CSS Generator**    | `src/lib/generator/index.ts`               | `generateTokensCss()`         |
| **DTCG Exporter**    | `src/lib/exporters/dtcg.ts`                | `toDTCG()`                    |

---

## Reserved Prefixes

Certain prefixes are reserved for engine-managed tokens:

```typescript
const RESERVED_PREFIXES = [
  "surface", // Surface context classes (.surface-card)
  "text", // Text utility classes (.text-high)
  "hue", // Hue modifier classes (.hue-brand)
  "bg", // Background utilities (.bg-surface)
  "border", // Border utilities (.bordered)
  "shadow", // Shadow utilities (.shadow-lg)
  "fg", // Foreground tokens (internal)
  "preset", // Preset utilities (.preset-bordered)
];
```

---

## Extension Points

### 1. Custom Key Colors

```json
{
  "anchors": {
    "keyColors": {
      "brand": "#8b5cf6",
      "accent": "#f59e0b",
      "link": "#3b82f6"
    }
  }
}
```

### 2. Custom Surfaces

```json
{
  "groups": [
    {
      "name": "Custom",
      "surfaces": [
        {
          "slug": "sidebar",
          "label": "Sidebar",
          "polarity": "page",
          "contrastOffset": { "light": 5, "dark": 5 }
        }
      ]
    }
  ]
}
```

### 3. Chart Palettes

```json
{
  "palette": {
    "hues": [15, 75, 135, 195, 255, 315],
    "targetChroma": 0.16
  }
}
```

---

## Open Questions & Future Work

1. **Anchor Validation** - Add semantic validation for anchor ordering
2. **Key Color Alias Resolution** - Detect circular references
3. **Config Versioning** - Add explicit version field for migrations
4. **Dynamic Defaults** - Support responsive defaults

---

## Related RFCs

- **RFC-TOKENS** - Three-tier token architecture (Primitives, Semantics, Modes)
- **RFC-CHARTS** - Reactive data visualization configuration
- **RFC-CONSUMER-CONTRACT** - User-facing API boundaries
- **RFC-INTEGRATION** - Design tool integration
- **RFC-TOOLING** - CLI commands and build tooling
- **RFC-AUDITING** - Configuration and output validation
