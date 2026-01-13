# RFC-029-STARLIGHT-CSS-STRATEGY: Reducing !important in Starlight Integration

**Status**: Draft  
**Date**: 2026-01-09  
**Authors**: System Architecture Team  
**Depends On**: RFC-020-CONSUMER-CONTRACT, RFC-021-INTEGRATION

## Abstract

This RFC defines a systematic approach to reducing `!important` usage in our Starlight CSS overrides from 61 declarations to ~3-5, while maintaining theme continuity and respecting both systems' design intent. We adopt a hybrid strategy combining CSS Layers (60% reduction), Component Overrides (30% reduction), and strategic specificity bumps (remaining cases), following the principle "Route, Don't Remove"—preserving Starlight's semantic structure while redirecting color resolution through Axiomatic's bridge exports.

## Problem Statement

Our Starlight integration adapter ([site/src/styles/starlight-custom.css](../../site/src/styles/starlight-custom.css)) currently contains **61 `!important` declarations**. This creates several problems:

### 1. Specificity Arms Race

Starlight's constructed stylesheets load **after** author CSS and frequently apply `!important` to their own rules. To override these, we're forced to use `!important` in our adapter, creating a brittle specificity battle that breaks when either system updates.

### 2. Maintenance Burden

Each `!important` represents a fragile override point:

- Changes to Starlight's DOM structure can break selectors
- Updates to Starlight's constructed stylesheet timing invalidate assumptions
- New Starlight components require new `!important` rules

### 3. Continuity Violations

Some `!important` rules override `background-color` or `color` with discrete mode-dependent values, which can cause visual "snaps" during `--tau` transitions even though the Axiomatic engine is computing continuous values.

### 4. Contract Ambiguity

The current approach makes it unclear which overrides are:

- **Intentional routing** (redirecting Starlight colors to Axiomatic bridge exports)
- **Defensive hacks** (fighting specificity battles)
- **Structural fixes** (working around Starlight assumptions)

### Root Cause: Late-Loading Constructed Stylesheets

Starlight uses JavaScript to inject constructed stylesheets during component initialization. These stylesheets:

1. Load **after** `<link rel="stylesheet">` author styles
2. Apply to the same CSSOM as author styles (not Shadow DOM)
3. Use `!important` liberally for their own defensive styling

This timing inversion defeats normal cascade rules, forcing adapters into specificity battles.

## Design Principles

### 1. Route, Don't Remove

**Bad** (deletes Starlight's semantic intent):

```css
.sl-link-button {
  background: none !important; /* Removes button styling */
}
```

**Good** (routes through Starlight's variables, which we map to Axiomatic):

```css
.sl-link-button {
  background-color: var(--sl-color-bg) !important;
}

/* Elsewhere in adapter bridge: */
:root body {
  --sl-color-bg: var(--axm-bridge-surface) !important;
}
```

By routing through `--sl-color-*`, we preserve Starlight's semantic structure while ensuring colors resolve through Axiomatic's continuity engine.

### 2. Single Writer Model

Only the Axiomatic engine writes theme-sensitive painted values. Adapters **map** foreign variables to bridge exports; they do not compute colors directly.

```css
/* FORBIDDEN - adapter computing colors */
.card {
  background: oklch(0.95 0 0) !important;
}

/* ALLOWED - adapter routing to bridge */
.card {
  background-color: var(--axm-bridge-surface) !important;
}
```

### 3. Late Binding

CSS variables enable runtime composition. The adapter establishes **mappings** at authoring time; the engine **resolves** colors at paint time based on context (`surface-*` class, `--tau`, `--alpha-*`).

### 4. Layer Priority

The CSS cascade assigns priority: **Unlayered CSS > Layered CSS**. By placing Starlight's styles in `@layer starlight` and leaving our overrides unlayered (or in a later layer), we can win specificity battles without `!important`.

### 5. Component Scope Beats Global Scope

Astro component `<style>` blocks have **higher specificity** than global `<link>` stylesheets when targeting the same element, even without `!important`. Overriding PageFrame.astro allows structural changes without specificity hacks.

## Proposed Solution: Hybrid Approach

We combine three techniques to achieve **95%+ reduction** in `!important` usage:

| Technique                | Impact          | Effort | Use Case                                             |
| ------------------------ | --------------- | ------ | ---------------------------------------------------- |
| **CSS Layers**           | ~60% reduction  | 4h     | Bulk variable mappings and routing rules             |
| **PageFrame Override**   | ~30% reduction  | 4h     | Layout-critical structural overrides                 |
| **Specificity Bumps**    | ~5% reduction   | 2h     | Remaining edge cases (pseudo-states, etc.)           |
| **Remaining !important** | ~5% (3-5 rules) | N/A    | Unavoidable (CSS lock pattern for late reassertions) |

### Technique 1: CSS Layers (Primary Strategy)

#### How It Works

We establish layer order in the adapter bridge file:

```css
/* site/src/styles/starlight-custom.css */
@layer starlight, axiomatic.overrides;

/* Starlight's own styles (if we could wrap them) */
@layer starlight {
  /* Starlight's rules would go here if we controlled their injection */
}

/* Our adapter overrides - UNLAYERED (highest priority) */
/* No @layer wrapper here! */
:root body {
  --sl-color-bg: var(--axm-bridge-surface);
  --sl-color-text: var(--axm-bridge-fg);
}
```

**Key insight**: We declare the layers but keep our adapter rules **unlayered**. Since unlayered CSS beats all layered CSS, we win without `!important`.

#### Why This Works

Per CSS Cascading Level 6:

> Styles in unlayered stylesheets have higher cascade priority than styles in any cascade layer.

Even though Starlight's constructed stylesheet loads **later**, if its rules are in a layer (or if we can force them into one via import wrapper), our unlayered rules win.

#### Implementation Strategy

**Option A: If Starlight Doesn't Use Layers**

Leave Starlight's constructed styles unlayered. We use **higher specificity** (not `!important`) for our overrides by targeting more specific selectors:

```css
/* Higher specificity than Starlight's `.page` */
:root .page.sl-flex.axm-starlight-page {
  background-color: var(--sl-color-bg); /* No !important */
}
```

**Option B: If We Can Influence Starlight's Layer**

If Starlight adopts layers (or we wrap their imports), we place their styles in `@layer starlight` and keep ours unlayered.

#### What This Eliminates

- ✅ All `--sl-color-*` variable mappings (currently 20+ `!important` rules)
- ✅ Most routing rules for backgrounds/text on chrome elements
- ✅ Border/hairline overrides

### Technique 2: Component Override (PageFrame.astro)

#### How It Works

Starlight's `PageFrame.astro` is the root layout component. We can override it by copying to our project and modifying:

```
site/src/components/
└── starlight/
    └── PageFrame.astro  # Overrides @astrojs/starlight/components/PageFrame.astro
```

**Component-scoped styles** (Astro's `<style>` blocks) have higher specificity than global `<link>` stylesheets when targeting elements in that component's template.

#### What This Enables

- ✅ Structural DOM changes (add wrapper divs with `surface-*` classes)
- ✅ Component-scoped overrides without `!important`
- ✅ Direct control over Starlight's chrome rendering

#### Example: Sidebar Wrapper

**Before** (fighting Starlight's sidebar styles):

```css
/* starlight-custom.css */
#starlight__sidebar {
  background-color: transparent !important; /* Remove Starlight bg */
}

#starlight__sidebar > .inner {
  background-color: var(--axm-bridge-surface) !important; /* Apply our bg */
}
```

**After** (component override):

```astro
<!-- PageFrame.astro -->
<aside id="starlight__sidebar" class="axm-starlight-sidebar-host">
  <div class="axm-starlight-sidebar surface-workspace">
    <!-- Starlight sidebar content -->
  </div>
</aside>

<style>
  /* Component-scoped - higher specificity, no !important */
  .axm-starlight-sidebar-host {
    background-color: transparent;
  }

  .axm-starlight-sidebar {
    min-height: 100%;
    /* background is painted by surface-workspace class */
  }
</style>
```

#### What This Eliminates

- ✅ Layout container overrides (page, header, sidebar)
- ✅ Wrapper/chrome structural fixes
- ✅ Z-index and positioning hacks

### Technique 3: Specificity Bumps (Tactical)

For remaining cases where layers and component overrides aren't sufficient, we use **selector specificity** rather than `!important`.

#### Doubling Technique

Repeat a class or attribute to increase specificity without changing behavior:

```css
/* Specificity: (0, 2, 1) */
body.sl-theme-dark.sl-theme-dark .some-element {
  color: inherit; /* No !important needed */
}
```

This beats Starlight's single-class selectors without `!important`.

#### `:where()` for Starlight, Specific Selectors for Us

If Starlight uses `:where()` (specificity 0) for their selectors, even a single class from us wins.

#### What This Eliminates

- ✅ Text color overrides on specific elements
- ✅ Pseudo-state styles (`:hover`, `:focus`)
- ✅ Component-specific tweaks

### Remaining !important (3-5 Rules)

Some `!important` rules are **architecturally necessary** and should remain:

#### 1. CSS Lock Pattern (2 rules)

```css
:root body,
:root .page {
  --sl-color-bg: var(--axm-bridge-surface) !important;
  --sl-color-text: var(--axm-bridge-fg) !important;
}
```

**Rationale**: Starlight's constructed stylesheets may **reassert** `--sl-color-*` on `:root` after our styles load. The lock pattern uses `!important` on a higher-specificity selector to prevent reassertion. This is the adapter's core contract enforcement.

#### 2. Continuity Invariants (1-2 rules)

```css
:root[data-theme] {
  color-scheme: light dark !important;
}
```

**Rationale**: We must prevent Starlight from setting `color-scheme: light` or `color-scheme: dark` discretely, which would break `light-dark()` continuity during `--tau` transitions. This is a **hard system constraint**.

#### 3. UA Style Resets (0-1 rules)

```css
math {
  margin: initial !important;
}
```

**Rationale**: User-agent styles for some elements (like MathML) may have `!important` in the UA sheet, requiring `!important` to override.

## Implementation Plan

### Phase 1: CSS Layers Infrastructure (Week 1, 4h)

**Goal**: Establish layer ordering and migrate variable mappings.

**Tasks**:

1. Add `@layer` declarations to `site/src/styles/starlight-custom.css`
2. Keep adapter bridge rules **unlayered** (outside `@layer` blocks)
3. Migrate all `--sl-color-*` mappings to unlayered section
4. Test: Verify theme continuity still works

**Success Criteria**:

- ~20 `!important` rules removed (variable mappings section)
- No visual regressions in light/dark/transition modes
- All `--sl-color-*` variables resolve through bridge exports

**Files Modified**:

- `site/src/styles/starlight-custom.css`

### Phase 2: PageFrame.astro Override (Week 1-2, 4h)

**Goal**: Override Starlight's root layout to control structure.

**Tasks**:

1. Copy `@astrojs/starlight/components/PageFrame.astro` to `site/src/components/starlight/`
2. Add wrapper divs with `surface-*` classes to header, sidebar, main content
3. Move layout-critical styles from `starlight-custom.css` to component `<style>` block
4. Add `class="axm-starlight-*"` markers for DOM wiring

**Success Criteria**:

- ~15-20 `!important` rules removed (layout overrides)
- Surface tokens correctly scope colors to chrome regions
- Sidebar, header, and content areas have independent surface contexts

**Files Created**:

- `site/src/components/starlight/PageFrame.astro`

**Files Modified**:

- `site/src/styles/starlight-custom.css`

### Phase 3: Migrate Existing Overrides (Week 2, 6h)

**Goal**: Systematically convert remaining `!important` rules.

**Tasks**:

1. Audit current `!important` usages (61 total)
2. Categorize each into:
   - **Layer candidate**: Can be unlayered
   - **Component candidate**: Belongs in PageFrame.astro
   - **Specificity candidate**: Use selector doubling
   - **Keep**: Architecturally necessary
3. Migrate each category systematically
4. Document rationale for remaining `!important` rules

**Success Criteria**:

- Down to 3-5 `!important` rules
- Each remaining rule has inline comment justifying necessity
- Full test coverage (visual regression, theme toggle, continuity)

**Files Modified**:

- `site/src/styles/starlight-custom.css`
- `site/src/components/starlight/PageFrame.astro`

### Phase 4: Documentation & Linting (Week 3, 2h)

**Goal**: Prevent regression and document patterns.

**Tasks**:

1. Add ESLint/Stylelint rule to warn on new `!important` in adapter bridge files
2. Document the 3-5 remaining `!important` rules in this RFC
3. Create integration guide for future foreign system adapters
4. Add test cases for each override pattern

**Success Criteria**:

- Linter prevents accidental `!important` additions
- Integration patterns documented for reuse (vendor component libraries, CMS chrome)
- Test suite covers continuity, specificity, and layer behavior

**Files Created**:

- `docs/guides/integration-adapters.md`

**Files Modified**:

- `eslint.config.js` or `.stylelintrc`
- `tests/starlight-integration.spec.ts`

## Consumer Guidance

This section provides guidance for developers integrating Axiomatic with Starlight or similar foreign theme systems.

### When to Use CSS Layers

**Use layers when**:

- You control the `<link>` or `@import` order in your HTML
- The foreign system doesn't use layers itself (so you can leave yours unlayered)
- You're overriding **many** rules in bulk (color palettes, variable mappings)

**Example**: Mapping a component library's design tokens to Axiomatic bridge exports.

```css
/* adapter-library.css */
@layer vendor; /* Declare but don't use */

/* Unlayered rules win */
:root {
  --vendor-bg: var(--axm-bridge-surface);
  --vendor-text: var(--axm-bridge-fg);
}
```

**Pitfall**: If the foreign system uses **unlayered** constructed stylesheets that load late, layers alone won't help. Combine with specificity bumps or component overrides.

### When to Use Component Overrides

**Use component overrides when**:

- You need **structural DOM changes** (add wrappers, change element order)
- The foreign system provides component override hooks (like Astro's component replacement)
- You're overriding layout-critical chrome (navigation, sidebars, page structure)

**Example**: Overriding a framework's header component to add `surface-*` classes.

```astro
<!-- components/vendor/Header.astro -->
<header class="surface-chrome">
  <div class="inner">
    <!-- Original header content -->
  </div>
</header>

<style>
  /* Component-scoped - higher specificity automatically */
  header {
    background-color: transparent; /* Let surface-chrome paint */
  }
</style>
```

**Pitfall**: Not all frameworks support component overrides. If the chrome is hardcoded in a compiled bundle, you're forced back to CSS overrides.

### When to Use Specificity Bumps

**Use specificity when**:

- Layers and component overrides aren't sufficient
- You're targeting a **small number** of specific elements
- The foreign system uses low-specificity selectors

**Example**: Overriding a button style with doubled selector.

```css
/* Higher specificity without !important */
.vendor-button.vendor-button {
  color: inherit; /* Axiomatic text token cascades in */
}
```

**Pitfall**: Over-reliance on specificity creates brittle selectors. If the foreign system changes class names, your overrides break. Use layers/components when possible.

### Common Integration Patterns

#### Pattern 1: Palette Lockdown (Variable Mapping)

**Scenario**: Foreign system defines `--vendor-*` color variables that components reference.

**Solution**: Map all vendor variables to Axiomatic bridge exports in a single unlayered rule block.

```css
/* adapter-vendor.css */
:root {
  --vendor-primary: var(--axm-bridge-fg);
  --vendor-surface: var(--axm-bridge-surface);
  --vendor-border: var(--axm-bridge-border-int);
  /* ...etc */
}
```

**Why it works**: Vendor components reference `var(--vendor-primary)`, which now resolves through Axiomatic. Single writer model maintained.

#### Pattern 2: Chrome Wrapper (Surface Scoping)

**Scenario**: Foreign system renders chrome (header, sidebar) with hardcoded colors.

**Solution**: Wrap chrome elements in divs with `surface-*` classes, override chrome backgrounds to `transparent`.

```astro
<!-- PageLayout.astro override -->
<div class="surface-chrome">
  <header style="background: transparent;">
    <!-- Foreign header content -->
  </header>
</div>
```

**Why it works**: `surface-chrome` computes background color; foreign header inherits it via transparency.

#### Pattern 3: Constructed Stylesheet Defense (Lock Pattern)

**Scenario**: Foreign system uses JS to inject stylesheets late, potentially reasserting variables.

**Solution**: Apply locks with `!important` on higher-specificity selectors.

```css
:root body {
  --vendor-bg: var(--axm-bridge-surface) !important;
}
```

**Why it's necessary**: Late-loaded constructed styles can't override `!important` on a higher-specificity selector, even with their own `!important` (selector specificity tiebreaker).

### Identifying Your Situation

Ask these questions:

1. **Does the foreign system use constructed stylesheets?**
   - Yes → You may need lock pattern (`!important` on variables)
   - No → Layers or component overrides likely sufficient

2. **Can you control the HTML structure?**
   - Yes → Use component overrides for chrome
   - No → Use CSS layers and specificity

3. **How many overrides do you need?**
   - Many (>20) → Use layers for bulk mappings
   - Few (<10) → Use specificity bumps
   - Structural → Use component overrides

4. **Does the foreign system expose override hooks?**
   - Yes → Prefer official APIs (component replacement, theme config)
   - No → Fall back to CSS overrides

### Integration Checklist

Before integrating with a new foreign system:

- [ ] Identify foreign color variables (`--vendor-*`)
- [ ] Determine if foreign system uses layers
- [ ] Check for component override hooks
- [ ] Test load order (author CSS vs. constructed sheets)
- [ ] Create single adapter bridge file (per Axiom 2.1)
- [ ] Map foreign variables to `--axm-bridge-*` only (per Axiom 3)
- [ ] Add adapter file to integration allowlist
- [ ] Document lock pattern usage if needed
- [ ] Test theme continuity (toggle during `--tau` transition)

## Open Questions

### Q1: Can we influence Starlight to adopt CSS Layers?

**Status**: Deferred (Low Priority)

**Context**: If Starlight placed its constructed styles in `@layer starlight`, we could eliminate all `!important` in variable mappings.

**Resolution**: Our hybrid approach works without upstream changes—the Layer strategy works by keeping _our_ rules unlayered, not by requiring Starlight to use layers. We'll file an upstream issue after successful implementation (proof of concept gives the request more weight), but this is not blocking.

### Q2: Does doubling specificity work across all browsers?

**Status**: Closed (Non-issue)

**Context**: The specificity calculation is spec-defined, but some older browsers may have bugs.

**Resolution**: CSS specificity calculation has been consistent across all browsers for over a decade. Selector doubling (`.foo.foo`) is a well-known pattern used by CSS frameworks like Tailwind and Bootstrap. No special testing needed beyond our normal browser matrix.

### Q3: Should we automate !important auditing?

**Status**: Resolved (Simplified approach)

**Context**: We could write a PostCSS plugin or ESLint rule to flag new `!important` additions in adapter files.

**Resolution**: A simple grep-based check in CI is sufficient. Add to `scripts/check` during Phase 3:

```bash
# Fail if !important count exceeds target ceiling (5)
count=$(grep -c '!important' site/src/styles/starlight-custom.css)
if [ "$count" -gt 5 ]; then
  echo "Error: !important count ($count) exceeds ceiling (5)"
  exit 1
fi
```

### Q4: What about vendor component libraries (e.g., Shoelace, Radix)?

**Status**: Out of Scope

**Context**: Component libraries with Shadow DOM behave differently (style encapsulation). Do we need additional patterns?

**Resolution**: Shadow DOM is a fundamentally different problem space. Components with Shadow DOM don't participate in the outer cascade—you can't override their internal styles with `!important` or layers. The solution there is CSS custom properties (which pierce Shadow DOM) or `::part()` selectors.

This RFC is specifically about non-Shadow DOM integrations like Starlight. Shadow DOM patterns would require a separate RFC if/when we integrate such a library.

### Q5: Should CSS locks be automated?

**Status**: Closed (Premature)

**Context**: If multiple foreign systems need lock patterns, we could generate lock rules from config.

**Resolution**: We currently have exactly one integration (Starlight). Codegen adds complexity and indirection. The lock pattern is ~5 lines of CSS. Even with 3 adapters, that's 15 lines of hand-written CSS vs. a build-time codegen system. Revisit if we ever have 5+ adapters with significant lock overlap.

## References

### Internal Documentation

- [RFC-020-CONSUMER-CONTRACT](RFC-020-CONSUMER-CONTRACT.md): Foundation for adapter constraints
- [RFC-021-INTEGRATION](RFC-021-INTEGRATION.md): Integration adapters, bridge exports, axioms
- [Axiom IV: Integration](../design/theory/axioms/04-integration.md): Theme integration contracts

### External Specifications

- [CSS Cascading and Inheritance Level 6](https://drafts.csswg.org/css-cascade-6/): Cascade layers specification
- [CSS Scoping Module Level 1](https://drafts.csswg.org/css-scoping/): Component style scoping

### Prior Art

- Starlight's constructed stylesheet approach: [Astro Docs](https://docs.astro.build/en/guides/styling/#load-a-static-stylesheet-via-link-tags)
- Astro component override patterns: [Overriding Components](https://starlight.astro.build/guides/overriding-components/)

### Research

- Original investigation: 7 approaches analyzed (see task background context)
  - CSS Layers: 60% reduction, 4h effort
  - Component Overrides: 30% reduction, 4h effort
  - Specificity Bumps: 20% reduction, simple
  - Other approaches: insufficient or too fragile

---

**Implementation Status**: Not started (Draft RFC)  
**Target Completion**: 3 weeks from approval  
**Estimated Effort**: 16 hours (development) + 4 hours (testing/documentation)
