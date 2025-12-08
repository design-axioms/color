# Audit Report: Home Page (Index)

## Summary

The Home Page is functional and responsive, but suffers from **significant content discrepancies** between viewports and **visual inconsistencies** in the Hero section. The "Premium" feel is compromised by the missing actions on Desktop and the lack of distinctiveness in Dark Mode code blocks.

## 1. Axiomatic Failures (Critical)

- **Starlight UI Leaks (Debug Mode)**:
  - **Issue**: The "Debug Mode" reveals that several key components are inheriting styles from the default Starlight theme instead of being fully "Axiomatic".
  - **Affected Areas**:
    - **Search Bar**: Inherits Starlight input styles (Desktop).
    - **Primary Action**: The "Try the Studio" button is flagged (All Viewports).
    - **Code Blocks**: The entire code snippet container is flagged (All Viewports).
    - **Feature Cards**: The "Why This Matters" cards are flagged (All Viewports).
    - **Inputs**: Example inputs in the body are flagged (All Viewports).
  - **Recommendation**: Refactor these components to use `InspectorSurface` or explicit Axiomatic tokens to ensure they participate in the system (and clear the debug flags).

- **Inconsistent User Journey**:
  - **Issue**: The Mobile view offers 3 clear actions ("Try the Studio", "Open in StackBlitz", "Read the Philosophy"). The Desktop view **only offers one** ("Try the Studio").
  - **Impact**: Desktop users are denied the "quick start" paths (StackBlitz) that mobile users get. This is likely a CSS display issue (hiding elements on `md:` breakpoint?).
  - **Recommendation**: Ensure all 3 actions are visible on Desktop, arranged horizontally or in a cluster.
  - **Update**: Confirmed missing in Desktop (Light & Dark). Mobile (Light & Dark) works correctly.

- **Missing H1 Title (Desktop)**:
  - **Issue**: The main H1 "Axiomatic Color" is missing on Desktop. The page starts with the tagline.
  - **Impact**: Brand identity is weak on desktop.
  - **Recommendation**: Restore the H1.
  - **Update**: Confirmed missing in Desktop (Light & Dark). Mobile (Light & Dark) works correctly.

## 2. Layout & Spacing

- **Hero Alignment**:
  - **Issue**: On Desktop, the H1 "Axiomatic Color" seems missing or replaced by the tagline "Stop picking colors...". On Mobile, the H1 is clearly visible.
  - **Recommendation**: Verify the `<h1>` visibility classes. The brand name should be visible on Desktop.
- **Mobile Obstruction**:
  - **Issue**: A floating overlay (browser tool?) obscures text on Mobile.
  - **Recommendation**: Ensure the site has sufficient bottom padding or z-index management if this is a site component. (If it's a user tool, ignore).

## 3. Theming & Contrast

- **Dark Mode Code Blocks**:
  - **Issue**: In Dark Mode, the code blocks blend too much with the page background. They lack "elevation" or a distinct border.
  - **Recommendation**: Lighten the code block background slightly or add a subtle border (`border-dec`) to separate it from the canvas.
- **Button Contrast (Dark Mode)**:
  - **Issue**: The "Click Me" button in Step 3 (Dark Mode) is black-on-dark-gray. It might fail APCA contrast standards for the button border/background against the card.
  - **Recommendation**: Verify the `surface-action` lightness in Dark Mode. It should probably be lighter (or use a brand hue) to stand out.

## 4. Component Fidelity

- **Snippet Previews**:
  - **Status**: ✅ High Fidelity. They look like "Surfaces".
  - **Note**: The "Preview" label and container styling work well to separate the example from the documentation.
- **"Why This Matters" Cards**:
  - **Status**: ✅ High Fidelity. Good use of icons and grid layout.

## Action Plan

1.  **Fix Hero Actions**: Debug the `display: none` or responsive classes on the Hero buttons.
2.  **Fix Hero Title**: Ensure "Axiomatic Color" H1 is visible on Desktop.
3.  **Polish Dark Mode**:
    - Increase contrast of Code Blocks.
    - Review `surface-action` contrast in Dark Mode.
