# The Algebra of Color Design: Omnibus Specification v4.1

**Abstract**: This document defines the Grand Unified Algebra for UI rendering. It models the UI as a state machine where color is a function of Environmental Context, Semantic Intent, Temporal State, User Preference, and System Mode.

## Part I: The Unified State Space ($\Sigma$)

The state of any UI element is defined by a 5-dimensional tuple.

$$ \Sigma = \langle \alpha, \nu, \tau, \gamma, \sigma \rangle $$

### 1. The Environmental Variables

These define the "Physics" of the world the element lives in.

- **Atmosphere ($\alpha$)**: The ambient potential $\langle H, \beta \rangle$.
  - $H$ (Hue): The context color (e.g., Brand Blue).
  - $\beta$ (Vibrancy): The potential energy (Coefficient).
- **Time ($\tau$)**: The continuous temporal scalar $\tau \in [-1, 1]$.
  - $-1.0$: Deep Night (Dark Mode).
  - $0.0$: The Gray Equator (Mid-Transition).
  - $+1.0$: Bright Day (Light Mode).

### 2. The Semantic Variables

These define the "Meaning" of the element.

- **Voice ($\nu$)**: The base semantic text weight (Token).
  - _Analogy_: The volume of the speaker (Whisper vs. Shout).
- **Gain ($\gamma$)**: The user's contrast preference.
  - $1.0$: Standard Contrast.
  - $>1.0$: High Contrast (Amplifies the Voice).
  - _Analogy_: The user turning up the volume knob.

### 3. The Mode Variable

This defines the "Rules of Physics" currently active.

- **System ($\sigma$)**: The rendering mode.
  - $0$ (Rich Mode): Standard rendering. The browser allows pixel painting.
  - $1$ (X-Ray Mode): Forced Colors (Windows HCM). The browser strips pixel data.

## Part II: The Universal Resolution Function ($\Phi$)

The Resolution Function $\Phi$ determines the final rendering. It acts as a Switch based on the System Variable ($\sigma$).

$$
\Phi(\Sigma) =
\begin{cases}
\Phi_{rich}(\alpha, \nu, \tau, \gamma) & \text{if } \sigma = 0 \text{ (Rich Mode)} \\
\Phi_{xray}(\alpha, \nu) & \text{if } \sigma = 1 \text{ (X-Ray Mode)}
\end{cases}
$$

### Branch A: Rich Mode ($\Phi_{rich}$)

Used when the browser allows us to paint pixels.

This executes the Bicone Physics and Tunneling logic. We use a Hybrid Manifold strategy: Linear for Spatial constraints, Quadratic for Temporal constraints.

1.  **Modulate Voice**: The Gain ($\gamma$) amplifies the contrast target of the Voice ($\nu$).
    $$ \nu' = \nu \times \gamma $$

2.  **Interpolate Time**: Solve the continuous animation state.
    $$ L_{bg} = f(\tau) \quad L_{text} = \text{lerp}(\nu'_{night}, \nu'_{day}, \tau) $$

3.  **Apply Physics**: Enforce the Bicone Limit ($\mathcal{K}$) and Parabolic Tunnel Factor ($\zeta$).
    $$ \zeta(\tau) = \tau^2 \quad \text{(Quadratic Tunnel)} $$
    $$ C_{final} = \beta_{\alpha} \times \underbrace{\text{Taper}(L_{bg})}_{\text{Linear Space}} \times \underbrace{\zeta(\tau)}_{\text{Quadratic Time}} $$

**Output**: A precise, gamut-safe, high-contrast `oklch()` color.

### Branch B: X-Ray Mode ($\Phi_{xray}$)

Used when the browser strips background colors (Forced Colors).

This executes a Topology Transformation. It maps Semantics to Geometry.

1.  **Map Atmosphere to Structure**:
    Instead of calculating a background tint, we project the Atmosphere vector onto the Border vector.
    $$ P(\alpha) \rightarrow \text{BorderWidth} \times \text{SystemColor} $$

2.  **Map Voice to Keyword**:
    The Voice token is mapped to the nearest semantic System Keyword.
    $$ P(\nu) \rightarrow \{ \text{CanvasText}, \text{ButtonText}, \text{LinkText} \} $$

**Output**: A geometry definition (Border/Stroke) and a System Keyword.

## Part III: The Operators

Classes are operators that transform the state tuple $\Sigma \rightarrow \Sigma'$.

### 1. Mood Operator ($M$)

Sets the Atmosphere ($\alpha$). In X-Ray mode, it sets a structural flag.

```css
.hue-brand {
  /* Rich Mode: Atmospheric Potential */
  --alpha-hue: var(--brand-hue);
  --alpha-beta: var(--brand-beta);

  /* X-Ray Mode: Structural Flag */
  --alpha-structure: 2px solid Highlight;
}
```

### 2. Surface Operator ($S$)

The Physics Engine. It handles the fork between Math (Rich) and Geometry (X-Ray).

```css
.surface-card {
  /* --- BRANCH A: RICH MODE --- */
  /* 1. Calculate Time & Spatial Taper (Linear) */
  --tau-l: calc((var(--time) + 1) * 50%);
  --_taper: calc(1 - abs(2 * var(--tau-l) - 1));

  /* 2. Calculate Temporal Tunnel (Quadratic) */
  /* Using Time^2 creates a stronger dampening effect near Gray (0) */
  --_tunnel: calc(var(--time) * var(--time));

  /* 3. Solve Limit */
  --_limit: calc(var(--alpha-beta) * var(--_taper) * var(--_tunnel));
  --final-chroma: min(var(--brand-chroma), var(--_limit));

  /* 4. Paint */
  background-color: oklch(
    from var(--surface-base) l var(--final-chroma) var(--alpha-hue)
  );

  /* --- BRANCH B: X-RAY MODE --- */
  @media (forced-colors: active) {
    /* Disable Math (OS enforces background) */
    background-color: Canvas;

    /* Map Atmosphere to Structure */
    /* If alpha is set, render the border defined by the Mood */
    border: var(--alpha-structure, 1px solid CanvasText);
  }
}
```

### 3. Voice Operator ($V$)

Sets the Voice ($\nu$) and handles Gain ($\gamma$).

```css
.text-subtle {
  /* 1. Standard Voice */
  --nu-target: var(--token-subtle);

  /* 2. Apply Gain (Gamma) via Media Query */
  @media (prefers-contrast: more) {
    /* Swap token for higher contrast version */
    --nu-target: var(--token-subtle-high);
  }

  /* 3. Render (Rich vs X-Ray handled by browser color resolution) */
  color: var(--nu-target);
}
```
