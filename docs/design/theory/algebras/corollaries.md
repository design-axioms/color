# Corollaries & Implications of the Color Algebra

> **Context**: Derived properties of the [Composition Algebra](./composition-algebra.md).

The core axioms of the Axiomatic Color System ($\Sigma = \langle \alpha, \nu, \tau \rangle$) lead to several powerful emergent properties. These are not "rules" we have to manually enforce; they are mathematical consequences of the system's design.

## 1. The Legibility Corollary

**Theorem**: Text is guaranteed to be legible on any Glass Surface, regardless of the user's input.

**Proof**:

1.  Legibility is a function of Contrast ($L_{text}$ vs $L_{bg}$).
2.  $L_{text}$ is solved by **Genesis** to be legible against a neutral background.
3.  $L_{bg}$ is tinted by Chroma ($C$).
4.  The **Universal Safety Theorem** clamps $C$ to the **Safe Bicone** ($C_{limit}$).
5.  The Safe Bicone is defined as the region where Chroma is low enough that it does not significantly degrade contrast.
6.  Therefore, $L_{bg}$ remains within the legible range.

**Implication**: You can let users pick _any_ theme color (even Neon Green), and the system will automatically dampen it to a safe pastel for backgrounds, while keeping it vibrant for buttons.

## 2. The Nesting Corollary (Infinite Depth)

**Theorem**: Glass Surfaces can be nested infinitely without "washing out" or "clipping."

**Proof**:

1.  Glass Surfaces inherit $\alpha$ (Atmosphere) from their parent.
2.  They apply a dampening function: $C_{new} = \min(C_{parent}, C_{limit})$.
3.  If $C_{parent}$ is already safe ($C_{parent} \le C_{limit}$), then $C_{new} = C_{parent}$.
4.  Therefore, nesting a Card inside a Card does not reduce the chroma further. It stabilizes.

**Implication**: You don't need to worry about "double-dampening." A Card inside a Sidebar looks exactly the same as a Card on the Page.

## 3. The Layout Independence Corollary

**Theorem**: The visual appearance of a component is independent of its layout container.

**Proof**:

1.  Layout containers (divs) are Identity Operators ($K(\Sigma) = \Sigma$).
2.  They transmit $\alpha$ and $\nu$ unchanged.
3.  Therefore, wrapping a component in a `div` or `section` has zero effect on its color physics.

**Implication**: Developers can refactor HTML structure (adding wrappers for grid/flex) without breaking the design system.

## 4. The Theme Portability Corollary

**Theorem**: Any subtree can be "re-themed" by changing the local Atmosphere ($\alpha$).

**Proof**:

1.  All child components derive their color from the inherited $\alpha$.
2.  A **Modifier Operator** (e.g., `.hue-brand`) updates $\alpha$ at a specific node.
3.  This update propagates down the tree to all Glass Surfaces.
4.  Solid Surfaces (Emitters) ignore the update (as intended).

**Implication**: You can turn a specific section of the page into a "Dark Mode" zone or a "Brand" zone simply by applying a class to the container. All buttons and text inside will adapt correctly.

## 5. The Twilight Safety Corollary

**Theorem**: No visual clashes occur during the transition between Light and Dark modes.

**Proof**:

1.  The transition is continuous ($\tau \in [-1, 1]$).
2.  The **Tunnel Function** $\zeta(\tau)$ forces Chroma to 0 when $\tau \approx 0$ (the moment of equal lightness).
3.  Therefore, at the point where contrast is most fragile (gray-on-gray), the system becomes purely monochromatic (safe).

**Implication**: The system supports smooth, animated transitions between themes without ugly "muddy" intermediate states.
