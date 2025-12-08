# Audit Results & Remediation Plan

This document collects all findings from the Deep Visual & Semantic Audit (Epoch 37, Phase 1).
For each finding, we document the observed issue, the root cause (if investigated), and the proposed remediation.

## 1. Home Page

### 1.1. Desktop Hero Visibility (Dark Mode)

**Issue**: The H1 title ("Axiomatic Color") and the Action buttons ("Get Started", "View on GitHub") were reported as invisible in Dark Mode.
**Investigation**:

- **Visual Inspection**: The provided screenshot (`qa-audit/index/desktop/dark/view.png`) shows the Hero content is **visible** and correctly styled (White text on Dark background).
- **Programmatic Check**: `debug-hero.ts` confirmed `visibility: visible` and `opacity: 1`.
- **Conclusion**: The issue might be environment-specific or resolved. However, we should still ensure `color-scheme: dark` is explicitly set on the Hero container to prevent regression.
  **Proposed Remediation**:
- Explicitly set `color-scheme: dark` on the Hero container as a safeguard.

### 1.2. Code Block Contrast (Dark Mode)

**Issue**: Code blocks in Dark Mode have a background color that mismatches the page surface, creating a "cutout" effect.
**Investigation**:

- **Visual Inspection**: Confirmed in screenshot. The code block background (`rgb(35, 38, 47)`) is lighter/bluer than the page background.
- **Programmatic Check**: `check-violations.ts` flagged this as a Surface Mismatch.
  **Proposed Remediation**:
- **Explicit Shiki Theme**: Configure Starlight to use a specific Shiki theme that aligns with our palette, or...
- **CSS Override**: Force `.astro-code` to use `background-color: var(--axm-surface-token)` (or a specific code surface token) and let the syntax highlighting sit on top. Note that Shiki themes often bake in the background color.

### 1.3. Starlight UI Leaks

**Issue**: Starlight's default styles are leaking into custom components (e.g., buttons, cards), causing visual inconsistencies.
**Investigation**:

- Observed in `starlight-custom.css` that we are fighting specificity wars (e.g., `.sl-link-button.primary`).
- Starlight's CSS is loaded _after_ our `theme.css` but _before_ `starlight-custom.css` (based on `astro.config.mjs` order).
  **Proposed Remediation**:
- **Scope Custom Components**: Wrap our custom components in a container (e.g., `.axm-scope`) and use higher specificity selectors or `@scope` to isolate them.
- **Reset Styles**: Create a robust reset for specific Starlight classes we want to repurpose (like `.card`).

## 2. Concepts Page

### 2.1. Surface Mismatches

**Issue**: `check-violations.ts` identified surface mismatches on:

- `<kbd>` (inside Search): Background doesn't match Action Soft surface.
- `<a>` (Sidebar Active Link): Background/Color doesn't match Page surface.
  **Investigation**:
- `<kbd>` likely has a default user-agent or Starlight style that conflicts with our surface tokens.
- Sidebar links use Starlight's active state styling which might not be using our semantic tokens.
  **Proposed Remediation**:
- **Override `<kbd>`**: Explicitly set `background-color` using our tokens.
- **Sidebar Theme**: Ensure Starlight's sidebar variables map to our semantic tokens (e.g., `--sl-color-bg-sidebar`, `--sl-color-text-accent`).

### 2.2. Spotlight Text Contrast (Light Mode)

**Issue**: In the "Context Visualizer" demo, the text inside the "Spotlight (Inverted Context)" box appears very faint or "ghostly" in Light Mode.
**Investigation**:

- **Visual Inspection**: The text is barely visible against the dark background of the inverted surface.
- **Root Cause**: Likely a font-weight issue or an opacity setting on the text color that doesn't work well when inverted.
  **Proposed Remediation**:
- Check the text color token used for inverted contexts. Ensure it has sufficient contrast (WCAG AA).
- Verify if `font-weight` is being reduced in this context.

### 2.3. Sidebar Active Color

**Issue**: The active link in the sidebar uses a blue color (`rgb(61, 80, 245)`) that appears to be hardcoded or a Starlight default, rather than a system token.
**Investigation**:

- **Visual Inspection**: The blue stands out as inconsistent with the brand palette (which uses Purple/Violet).
- **Dark Mode**: This blue might vibrate against the dark background.
  **Proposed Remediation**:
- Map the active state color to a brand token (e.g., Primary or Accent).

### 2.4. Code Block Integration (Dark Mode)

**Issue**: Similar to the Home Page, code blocks in Dark Mode have a background that clashes with the site theme.
**Investigation**:

- **Visual Inspection**: The "GitHub Dark" background of the code block sits awkwardly on the site's dark background.
  **Proposed Remediation**:
- See 1.2 (Global Code Block Fix).

## 3. Tokens Page

### 3.1. Code Block Contrast

**Issue**: Code blocks (`<pre>`) have a background color that mismatches the page surface in both Light and Dark modes.
**Investigation**:

- **Visual Inspection**: Confirmed. The mismatch is most prominent in Dark Mode, where the code block is lighter than the page.
- **Status**: Confirmed as a Global Issue (see 1.2).

### 3.2. Copy Button Mismatch

**Issue**: The copy button inside code blocks has a surface mismatch.
**Investigation**:

- **Visual Inspection**: Hard to see in the full-page screenshot, but likely inherits the code block issue.
  **Proposed Remediation**:
- Addressed by Global Code Block Fix.

## 4. Mobile / Responsive

### 4.1. Token Tables (Mobile)

**Issue**: On mobile devices, the tables on the Tokens page are unreadable. The long token names force the "Description" column to be extremely narrow, causing aggressive text wrapping.
**Investigation**:

- **Visual Inspection**: Confirmed in `qa-audit/tokens/mobile/light/view.png`.
- **Root Cause**: Standard HTML table behavior without a responsive wrapper or transformation.
  **Proposed Remediation**:
- **Scrollable Wrapper**: Wrap tables in `overflow-x: auto` so they maintain their width and can be scrolled.
- **Stacked Layout**: Alternatively, use CSS Grid to stack the "Token" and "Description" cells vertically on mobile.

### 4.2. Context Visualizer (Mobile)

**Issue**: The "Context Visualizer" demo on the Concepts page is too cramped on mobile to effectively demonstrate the nesting of surfaces.
**Investigation**:

- **Visual Inspection**: The nested boxes are squashed.
  **Proposed Remediation**:
- **Minimum Width**: Give the container a `min-width` and allow it to scroll horizontally.
- **Stacking**: Or, redesign the demo to stack vertically on mobile (though this might break the "nesting" metaphor).

## 5. Consolidated Remediation Plan

The following actions are required in the next phase:

1.  **Fix Home Page Hero**:
    - Force `z-index: 1` and `position: relative` on `.hero-content`.
    - Explicitly set `background-color: transparent` on `.hero`.
    - Verify Starlight overrides.

2.  **Fix Code Blocks (Global)**:
    - Override `.astro-code` background to use `var(--axm-surface-token)` (or a specific code surface).
    - Ensure syntax highlighting remains visible (check contrast).

3.  **Fix Starlight Leaks & Violations**:
    - Scope custom components (`.card`, `.sl-link-button`) to prevent style leakage.
    - Fix `<kbd>` background.
    - Audit Sidebar link colors and map them to Axiomatic tokens.

4.  **Verify Dark Mode Inheritance**:
    - Ensure `color-scheme: dark` is correctly propagating to all roots (including `iframe`s if any).

5.  **Fix Mobile Layouts**:
    - **Tables**: Implement a responsive table solution (scrollable wrapper or stacked layout) for the Tokens page.
    - **Context Visualizer**: Ensure the demo has a minimum width and scrolls horizontally on mobile to preserve the nesting visualization.

## 6. Design Quality & Polish (User Reported)

### 6.1. Visual Density (Buttons)

**Issue**: Buttons and interactive elements appear "too packed together" in some contexts.
**Investigation**:

- **Review**: Re-evaluating the "Surface Hierarchy" grids and Mobile Hero.
- **Observation**: While `gap-4` is standard, the visual weight of the buttons might require more breathing room, especially on mobile or when stacked.
  **Proposed Remediation**:
- Increase gap tokens or padding in button groups.
- Review the "Action" vs "Soft Action" grouping.

### 6.2. Missing Card Styling

**Issue**: Some elements appear unstyled and "should be cards".
**Investigation**:

- **Potential Candidates**: The "Usage" or "Utility Classes" lists on the Tokens page, or the "Surface Hierarchy" examples on the Concepts page.
- **Root Cause**: Likely using standard Markdown lists or `<div>`s without the `.surface-card` class.
  **Proposed Remediation**:
- Audit all "list of things" sections.
- Wrap distinct content blocks in `.surface-card` to give them structure and separation from the background.

### 6.3. Example Differentiation

**Issue**: Examples illustrating different concepts (e.g., Action vs. Spotlight) look too similar.
**Investigation**:

- **Observation**: The "Surface Hierarchy" grid uses the same layout for every surface type. While the _colors_ change, the _shape_ and _structure_ are identical.
- **Effect**: It's hard to distinguish the _semantic meaning_ of "Spotlight" vs "Action" just by looking at a colored box.
  **Proposed Remediation**:
- **Distinct Layouts**: Change the content _inside_ the examples to match the use case.
  - **Action**: Show a button or a form.
  - **Spotlight**: Show a "Feature Highlight" or "Callout".
  - **Card**: Show a content card with image/text.
- **Labeling**: Ensure labels clearly describe the _intent_, not just the token name.
