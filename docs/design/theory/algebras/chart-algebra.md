# The Algebra of Reactive Charts

> **Context**: Extending the Grand Unified Algebra to Data Visualization.

This document defines the mathematical model for **Reactive Charts**, ensuring that data visualization components maintain conceptual integrity with the core system ($\Sigma$).

## 1. The Problem Space

Standard charts rely on static color tokens (e.g., "Red", "Blue"). This fails in a reactive system because:
1.  **Nested Inversion**: A chart in a dark card on a light page needs "Dark Mode" colors (pastels) to be legible, even if the global theme is Light.
2.  **Atmospheric Dissonance**: A neutral chart looks out of place in a highly vibrant or tinted dashboard.
3.  **X-Ray Blindness**: Charts relying solely on hue become invisible in Forced Colors Mode.

## 2. The Chart State ($\Sigma_{chart}$)

We extend the Unified State Tuple to govern chart rendering.

$$ \Sigma_{chart} = f(\Sigma) = f(\langle \alpha, \nu, \tau, \gamma, \sigma \rangle) $$

### 2.1. Time ($\tau$) and Reactive Lightness

Chart colors must maintain APCA contrast against their *local* background. Since the background lightness is a function of Time ($\tau$), the chart lightness must also be a function of $\tau$.

We define a chart color not as a single value, but as a **Lightness Range** $[L_{light}, L_{dark}]$.

$$ L_{chart}(\tau) = L_{mid} - (k \times \tau) $$

Where:
- $L_{mid} = \frac{L_{dark} + L_{light}}{2}$
- $k = \frac{L_{dark} - L_{light}}{2}$
- $\tau \in [-1, 1]$ (Day to Night)

**Behavior:**
- When $\tau = 1$ (Light Mode), $L = L_{light}$ (Darker color for contrast against white).
- When $\tau = -1$ (Dark Mode), $L = L_{dark}$ (Lighter pastel for contrast against black).
- When $\tau \approx 0$ (Twilight), the color interpolates linearly.

### 2.2. Atmosphere ($\alpha$) and Vibrancy Injection

To ensure charts harmonize with the "Mood" of the interface, we allow the **Atmosphere Vibrancy** ($\beta$) to influence the chart's Chroma ($C$).

$$ C_{chart} = C_{base} + (\beta \times k_{vibrancy}) $$

Where:
- $C_{base}$: The canonical chroma of the chart category.
- $\beta$: The current environment's vibrancy coefficient.
- $k_{vibrancy}$: The injection factor (currently $0.5$).

**Behavior:**
- In a **Neutral** theme ($\beta \approx 0$), charts use their base chroma.
- In a **Vibrant** theme ($\beta \approx 0.2$), charts become "super-charged" to match the high-energy environment.

### 2.3. System ($\sigma$) and The Hollow Chart

When $\sigma = 1$ (X-Ray / Forced Colors), the system strips background colors. To preserve data legibility, we apply the **Hollow State** transformation to charts.

$$ \Phi_{xray}(Chart) = \text{Border}(1px, \text{ButtonText}) + \text{Pattern}(i) $$

*Note: Pattern generation is a future enhancement. Currently, we rely on borders.*

## 3. Implementation

The algebra is implemented via CSS `calc()` to ensure it responds instantly to context changes (e.g., dragging a chart from a light area to a dark area).

```css
--axm-chart-1: oklch(
  calc(L_mid - (k * var(--tau)))      /* Reactive Lightness */
  calc(C_base + (var(--alpha-beta) * 0.5)) /* Vibrancy Injection */
  H_base
);
```

## 4. Summary

1.  **Charts are Reactive**: They are not static colors but mathematical functions of the environment.
2.  **Lightness follows Time**: $L \propto -\tau$.
3.  **Chroma follows Atmosphere**: $C \propto \beta$.
4.  **Structure follows System**: Borders appear when $\sigma=1$.
