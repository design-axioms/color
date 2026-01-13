# Kano-QFD Options Analysis: Resolving the RFC010/RFC029 Conflict

**Date**: 2026-01-12  
**Status**: ✅ IMPLEMENTED — Option B.2 complete  
**Decision**: Expand bridge exports to include semantic accent colors

---

## The Corrected Architectural Understanding

### How Axiomatic Works

1. **Class tokens** (`.surface-page`, `.text-high`) set **low-level token variables**:
   - `--axm-surface-token`, `--axm-text-high-token`, `--axm-border-dec-token`, etc.
   - These are computed colors based on the current context (mode, surface, contrast)

2. **The engine** reads these tokens and:
   - Applies physics (chroma bicone, HK buffer, etc.)
   - Produces final colors via `background-color`, `color`, `border-color`
   - Exports those computed colors as **bridge exports** (`--axm-bridge-*`)

3. **Bridge exports** are the answer to: _"If I applied `.text-high` inside `.surface-page`, what color would the engine produce?"_

### The Adapter Constraint (Clarified)

**Adapters are wiring-only.** The only valid pattern is:

```css
--framework-var: var(--axm-bridge-X);
```

- ❌ No `oklch()` literals
- ❌ No `color-mix()` composition
- ❌ No `calc()` on colors
- ✅ Only direct wiring from bridge exports

**Why?** Because if a color doesn't exist in the bridge vocabulary, the answer isn't to synthesize it—it's to expand the vocabulary. The adapter should behave like Tailwind's `@apply .class-token`: asking the engine for the result of applying that class.

---

## Implementation Summary

### Bridge Exports Added to Engine

The following semantic accent exports were added to `css/engine.css`:

| Export                                            | Role                                |
| ------------------------------------------------- | ----------------------------------- |
| `--axm-bridge-accent-surface`                     | Low contrast accent (backgrounds)   |
| `--axm-bridge-accent`                             | Mid contrast accent (icons, badges) |
| `--axm-bridge-accent-fg`                          | High contrast accent (text, links)  |
| `--axm-bridge-info-surface/info/info-fg`          | Info semantic (blue)                |
| `--axm-bridge-success-surface/success/success-fg` | Success semantic (green)            |
| `--axm-bridge-warning-surface/warning/warning-fg` | Warning semantic (orange)           |
| `--axm-bridge-danger-surface/danger/danger-fg`    | Danger semantic (red)               |

These use theme-defined hues (`--_axm-hue-*`) and chromas (`--_axm-chroma-*`), ensuring they're configurable per-project and animate with `--tau` transitions.

### Adapter Wiring

The Starlight adapter now uses pure wiring for all color mappings:

```css
/* Accents */
--sl-color-accent-low: var(--axm-bridge-accent-surface);
--sl-color-accent: var(--axm-bridge-accent);
--sl-color-accent-high: var(--axm-bridge-accent-fg);

/* Semantic colors */
--sl-color-blue-low: var(--axm-bridge-info-surface);
--sl-color-green-low: var(--axm-bridge-success-surface);
--sl-color-orange-low: var(--axm-bridge-warning-surface);
--sl-color-red-low: var(--axm-bridge-danger-surface);
/* etc. */
```

### Verification

- ✅ `node scripts/check-rfc010.ts` — 0 violations
- ✅ `node scripts/check-starlight-adapter-contract.ts` — passed

---

## The Gap: What's Missing from the Bridge?

The current bridge exports (7 total):

| Export                    | Semantic Role                       |
| ------------------------- | ----------------------------------- |
| `--axm-bridge-surface`    | Current surface background          |
| `--axm-bridge-fg`         | Generic foreground (alias for high) |
| `--axm-bridge-fg-high`    | High-emphasis text                  |
| `--axm-bridge-fg-body`    | Body text                           |
| `--axm-bridge-fg-subtle`  | De-emphasized text                  |
| `--axm-bridge-border-dec` | Decorative borders                  |
| `--axm-bridge-border-int` | Interactive borders                 |

What Starlight needs (mapped from `--sl-color-*`):

| Starlight Slot                            | Semantic Need     | Current Mapping          | Status |
| ----------------------------------------- | ----------------- | ------------------------ | ------ |
| `gray-1` (text-high)                      | Highest contrast  | `--axm-bridge-fg-high`   | ✅     |
| `gray-2` (text-body)                      | Body text         | `--axm-bridge-fg-body`   | ✅     |
| `gray-3` (text-muted)                     | Muted text        | `--axm-bridge-fg-subtle` | ✅     |
| `gray-4` (borders/hairlines)              | Light separator   | synthesized              | ❌     |
| `gray-5` (backgrounds)                    | Background        | `--axm-bridge-surface`   | ✅     |
| `gray-6` (elevated surface)               | Card/overlay      | synthesized              | ❌     |
| Accent colors (6 hue families × 3 levels) | Semantic callouts | synthesized              | ❌     |

**Missing from bridge**:

- An "intermediate" text level (gray-4 equivalent, between subtle and border)
- A "subtlest" text level (even more muted than subtle)
- Surface elevation variants (card, overlay, popover)
- Semantic accent colors (info, success, warning, danger, etc.)

---

## Option B (Revised): Expand Bridge Exports

### B.1: Minimal Expansion (Gray Gaps Only)

Add exports for the missing gray levels:

```css
/* Already exists in token layer as --axm-text-subtlest-token */
@property --axm-bridge-fg-subtlest {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}

/* May need new token: between fg-subtle and border-dec */
@property --axm-bridge-fg-muted {
  syntax: "<color>";
  inherits: true;
  initial-value: transparent;
}
```

**Effort**: S-M  
**Risk**: Low—these are natural extensions of existing patterns  
**Coverage**: Fixes gray-4 and gray-6 mappings

### B.2: Full Expansion (Semantic Roles)

Add exports for all semantic roles that adapters commonly need:

**Foreground stack (8 levels)**:

- `--axm-bridge-fg-max` (absolute black/white)
- `--axm-bridge-fg-high` ✅
- `--axm-bridge-fg-body` ✅
- `--axm-bridge-fg-subtle` ✅
- `--axm-bridge-fg-subtlest` (NEW)
- `--axm-bridge-fg-muted` (NEW)
- `--axm-bridge-fg-ghost` (barely visible)

**Surface stack (3+ levels)**:

- `--axm-bridge-surface` ✅ (current context)
- `--axm-bridge-surface-elevated` (NEW—card/popover)
- `--axm-bridge-surface-inset` (NEW—recessed/well)

**Semantic accents (role-based)**:

- `--axm-bridge-accent-info`
- `--axm-bridge-accent-success`
- `--axm-bridge-accent-warning`
- `--axm-bridge-accent-danger`

**Effort**: M-L  
**Risk**: Medium—API surface growth is hard to undo  
**Coverage**: Full Starlight palette + most other frameworks

### B.3: Token-Scoped Exports (Virtual @apply)

Instead of computing colors in the engine, expose the **token values themselves** scoped to a virtual context:

```css
/* Engine exposes: "If you were inside .surface-card, what would text-subtle be?" */
--axm-bridge-surface-card-fg-subtle: var(--computed-value);
```

This is equivalent to:

```css
.surface-card {
  --axm-bridge-fg-subtle: oklch(...);
}
```

**But**: The adapter doesn't nest inside `.surface-card`. It needs the value _as if_ it were nested.

**Effort**: L (requires new engine architecture)  
**Risk**: High—complex implementation, unclear semantics  
**Coverage**: Complete, but at high cost

---

## Option D (Revised): Accept Fidelity Loss

Map every Starlight slot to the _nearest_ available bridge export:

| Starlight Slot | Fallback Mapping         | Visual Impact           |
| -------------- | ------------------------ | ----------------------- |
| `gray-4`       | `--axm-bridge-fg-subtle` | Borders may be too dark |
| `gray-6`       | `--axm-bridge-surface`   | No surface elevation    |
| Accent colors  | Remove entirely          | Asides are monochrome   |

**Effort**: XS  
**Risk**: High visual regression  
**Coverage**: Complete contract compliance, degraded aesthetics

---

## Recommendation (Revised)

**Path forward**: **Option B.1** (minimal expansion) as immediate fix, with **B.2** as the roadmap.

### Immediate (This Phase)

1. Verify that `--axm-text-subtlest-token` already exists in generated themes (✅ confirmed in vercel-demo)
2. Add `--axm-bridge-fg-subtlest` to engine.css (follows existing pattern)
3. Update adapter to use `--axm-bridge-fg-subtlest` for gray-4/gray-6 roles
4. For accent colors: **accept fidelity loss for now** (monochrome asides)

### Roadmap (Future Phase)

1. Design semantic accent system (`--axm-bridge-accent-*`)
2. Add surface elevation exports (`--axm-bridge-surface-elevated`)
3. Update adapter to use new exports
4. Document the full "virtual @apply" mapping in RFC-021

### Why Not Full B.2 Now?

- Accent colors require design decisions about hue configuration
- Surface elevation requires understanding the surface hierarchy
- These deserve careful design, not rushed implementation

---

## Decision Required

1. **Confirm the constraint**: Adapters do pure wiring only, no computation. (YES per user clarification)
2. **Accept minimal expansion**: Add `--axm-bridge-fg-subtlest` to unblock gray mappings.
3. **Accept temporary fidelity loss**: Accent colors map to nearest semantic role (or transparent) until the accent system is designed.
4. **Roadmap full expansion**: Design the complete bridge vocabulary as a separate workstream.

---

## Implementation Sketch (Option B.1)

### 1. Add Bridge Export to Engine

In `css/engine.css`, add after line 240:

```css
--axm-bridge-fg-subtlest: oklch(
  from var(--axm-text-subtlest-token) calc(l + (0.05 * var(--_axm-bridge-fg-C)))
    var(--_axm-bridge-fg-C) var(--alpha-hue)
);
```

### 2. Update Adapter Mappings

In `site/src/styles/starlight-custom.css`, replace synthesized grays:

```css
/* Before: synthesized */
--sl-color-gray-4: color-mix(...);

/* After: wired */
--sl-color-gray-4: var(--axm-bridge-fg-subtlest);
```

### 3. Handle Accent Colors (Temporary)

```css
/* Before: synthesized */
--sl-color-accent-low: oklch(0.85 0.15 250);

/* After: fallback to border (acceptable fidelity loss) */
--sl-color-accent-low: var(--axm-bridge-border-dec);
/* Or: remove accent overrides entirely, let Starlight use its defaults */
```

### 4. Verify

```bash
node scripts/check-rfc010.ts
# Should see gray violations resolved, accent violations remain
# If accent colors are removed: 0 violations
```
