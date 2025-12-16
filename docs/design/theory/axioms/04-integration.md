# Axiom IV: The Laws of Integration

These axioms describe how the system interacts with the world, ensuring consistency and interoperability.

## 7. The Code is the Source of Truth

Design tools (Figma, Sketch) are downstream consumers of the code, not the other way around.

### Generation

Tokens are generated from the configuration code.

- We do not manually maintain a Figma library and a CSS file separately.
- We generate the CSS, and (eventually) generate the Figma tokens from the same source.

### No Manual Tweaks

We do not manually tweak individual hex codes in the output.

- If a color looks wrong, we adjust the **algorithm** or the **configuration constraints**.
- This ensures that fixes propagate to the entire system, not just one instance.

### Isomorphism

The core logic (`src/lib`) is isomorphic.

- It runs identically in Node.js (CLI) and the Browser (Theme Builder).
- This ensures the preview in the builder always matches the build output exactly.

## 8. No Magic Numbers

All values are derived from the configuration (Anchors, Curves).

### Math vs. Magic

We reject arbitrary values like "Blue-500" or "Gray-10".

- Why is it 500? Why is it that hex code?
- In Axiomatic Color, every value has a derivation trace.

### Derivation

Every color is the result of a solver function:
$$ Color = f(Context, Intent) $$

- If you change the Context (e.g., darken the theme), the Color updates automatically.

## 9. Baseline Newly Available

We build for the modern web, not the legacy web.

### Policy

We adopt features that are "Newly Available" in major browsers (last 2 versions).

- We do not burden the codebase with polyfills or fallbacks for obsolete browsers unless strictly necessary.
- We believe that by the time this system is widely adopted, these features will be standard.

### Examples

- **Color Spaces**: `oklch()`, `p3` gamut.
- **CSS Features**: `light-dark()`, `@property`, `popover`, `:has()`.
- **Runtime**: Node 24.

## 11. Theme Switching: Endpoints vs. Continuity (The `light-dark()` Contract)

We use `light-dark()` to select the correct **endpoint** for a given context (derived from `color-scheme`), but we do **not** rely on “animating `light-dark()`”.

The continuity contract is:

- **Endpoints**: `light-dark()` resolves immediately when `color-scheme` changes.
- **Continuity**: the pixels stay continuous because we transition **registered, computed properties** (e.g. the surface/text colors derived from tokens) and/or a continuous state variable like `--tau`.

In other words, `light-dark()` is a switch; the animation happens in the computed values that paint.

### Integration Warning

If an integration layer (a component library, theme framework, or a constructed stylesheet) sets `background-color`/`color` directly to mode-dependent values, or temporarily disables transitions (e.g. `transition: none`), it can defeat the continuity path even though the engine is correct. The fix is to let Axiomatic surfaces own the painted properties (or inherit them), and ensure transitions remain enabled for those properties.

## Theme integration contract (runtime + adapters)

Theme switching must remain deterministic, auditable, and boundary-scoped.

- **Runtime**: Theme mode MUST be bridged through `ThemeManager` into an engine-owned semantic state on the root (e.g. `data-axm-mode`, `data-axm-resolved-mode`). Runtime code MUST NOT write/read CSS variables as an integration mechanism.
- **Adapters**: Foreign paint systems MUST consume Axiomatic through adapter mappings that are confined to a single bridge stylesheet per adapter, and adapters MUST consume bridge exports (not engine-private plumbing).

See the normative contracts:

- RFC010 (consumer contract: no engine addressing)
- RFC013 (adapters + bridge exports, single bridge file)
- RFC014 (ThemeManager integration surface; semantic state; no plumbing)

## 10. Standard CSS First

We write standard CSS, not a proprietary dialect.

### No Extensions

We do not use non-standard extensions (like Sass mixins, custom functions, or proprietary at-rules) that require a specific preprocessor to understand.

- Our CSS should be readable and understandable by anyone who knows the spec.
- We use tools (like Lightning CSS) only for **bundling** (imports) and **optimization** (minification), not for language extension.

### Spec Compliance

If a feature is in the spec (even if new), we use it.

- We prefer native CSS features (`@property`, `calc()`, nesting) over build-time abstractions.
- We trust the browser engine to do the heavy lifting (see [Law of Late Binding](../axioms/05-engineering.md#12-the-law-of-late-binding)).
