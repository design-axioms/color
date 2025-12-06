# The Algebra of Continuous Color Design

> **Context**: The physics and grammar of the Axiomatic Color system. ([View Changelog](./algebras/composition-algebra-changelog.md))

This document defines the "Physics" of the Axiomatic Color system. It replaces the previous static heuristic model with a **Reactive Physics Model** based on continuous state interpolation.

## 1. The State Space ($\Sigma$)

The system state at any point in the DOM tree is defined by the **Mnemonic State Tuple** $\Sigma$. This configuration space represents the continuous interpolation between environmental extremes.

1292590 \Sigma = \langle \alpha, \nu, \tau \rangle 1292590

Where:

1.  **Atmosphere ($\alpha$)**: The environmental vector.
    1292590 \alpha = \langle H, \beta \rangle 1292590
    - \in S^1$: **Hue**. The base angle of the environment.
    - $\beta \in [0, 1]$: **Vibrancy Coefficient**. The maximum potential chroma of the environment.

2.  **Voice ($\nu$)**: The semantic intent.
    - $\nu \in \text{Tokens}$: A reference to a pre-solved lightness constant derived by **Genesis** (e.g., `text-high`, `text-subtle`).

3.  **Time ($\tau$)**: The continuous temporal scalar.
    - $\tau \in [-1, 1]$: Represents the shift from Night (himBHs1$) to Day ($).
    - This replaces the discrete "Light/Dark" mode switch with a continuous manifold.

> **In Plain English**:
>
> - **Atmosphere ($\alpha$)**: The "Weather" of the room. Is it a sunny yellow room or a cool blue room?
> - **Voice ($\nu$)**: The "Script". What is the actor saying? (Heading, Caption, etc.)
> - **Time ($\tau$)**: The "Clock". Is it noon (Day Mode) or midnight (Night Mode)?

## 2. The Architecture: Genesis vs. Algebra

The system is explicitly split into two domains to guarantee performance and correctness.

### 2.1. Genesis (Build Time)

The **Genesis** engine solves the "Hard Math" (APCA Contrast) offline. It calculates the exact Lightness ($) required for a specific Voice ($\nu$) to be legible against a specific background.

<!-- prettier-ignore -->
1292590 \Psi(K, T) \rightarrow \nu_{constant} 1292590

These constants are baked into the CSS as variables (e.g., `--text-high-L: 98%`).

### 2.2. Algebra (Render Time)

The **Algebra** (CSS Engine) is a "Dumb Mixer." It does not solve for contrast. It interpolates the Genesis constants based on Time ($\tau$) and clamps the Atmosphere ($\alpha$) based on the Universal Safety Theorem.

1292590 \Phi(\Sigma) \rightarrow \text{oklch}(L, C, H) 1292590

## 3. The Operators

Classes in the system are **Operators** that transform the state $\Sigma \rightarrow \Sigma'$.

### 3.1. The Surface Split

We distinguish between two topological types of surfaces.

#### 3.1.1. Glass Surfaces ({glass}$)

Glass surfaces are **Filters**. They inherit the Atmosphere ($\alpha$) from their parent but apply **Bicone Dampening** to ensure the background remains a subtle tint, safe for text.

<!-- prettier-ignore -->
1292590 S_{glass}(\langle \alpha, \nu, \tau \rangle) = \langle \text{Dampen}(\alpha), \nu_{reset}, \tau \rangle 1292590

> **In Plain English**: A Glass Card is like a tent. It sits _inside_ the landscape. It takes the color of the environment (Atmosphere) but stretches it thin so it's just a whisper of color.

#### 3.1.2. Solid Surfaces ({solid}$)

Solid surfaces are **Emitters**. They represent "Genesis Pairs" (like Primary Buttons) where the color is derived at build-time to be maximal. They do _not_ dampen. They establish a _new_ Atmosphere.

<!-- prettier-ignore -->
1292590 S_{solid}(\langle \alpha, \nu, \tau \rangle) = \langle \alpha_{new}, \nu_{new}, \tau \rangle 1292590

> **In Plain English**: A Solid Button is a light source. It ignores the ambient weather and shines with its own specific color (e.g., Brand Blue). It resets the local physics.

## 4. The Universal Safety Theorem (Adaptive Clamping)

To guarantee that text is always readable on Glass Surfaces, we enforce the **Universal Safety Theorem**. The Chroma ($) of any Glass Surface is mathematically constrained to lie within the **Safe Bicone**.

### 4.1. The Vibrancy Limit ({limit}$)

The maximum allowed Chroma is the intersection of three functions:

1292590 C\_{limit} = \beta(H) \cdot \tau(L) \cdot \zeta(\tau) 1292590

1.  **The Sine Wave ($\beta(H)$)**: The hue-dependent boundary. Yellows can be more vibrant than Blues without clipping.
    <!-- prettier-ignore -->
    1292590 \beta(H) \approx C_{floor} + (C_{ceil} - C_{floor}) \cdot \frac{1 + \sin(H + \phi)}{2} 1292590
    - Where {floor} \approx 0.04$ (Blue Limit)
    - Where {ceil} \approx 0.18$ (Yellow Limit)

2.  **The Taper ($\tau(L)$)**: The lightness-dependent boundary. As Lightness approaches Black (0) or White (1), Chroma must drop to 0 to fit in the gamut.
    1292590 \tau(L) = 1 - |2L - 1| 1292590

3.  **The Tunnel ($\zeta(\tau)$)**: The motion-dependent boundary. As the system transitions between Day and Night ($\tau \approx 0$), contrast is lowest, so Chroma is throttled to prevent clashes.

> **In Plain English**:
>
> - **The Sine Wave**: We allow Yellow to be brighter than Blue because the human eye (and screens) can handle it.
> - **The Taper**: You can't have a "Vibrant Black" or "Vibrant White." Physics demands they fade to gray.
> - **The Tunnel**: During the twilight transition (Day to Night), we dim the colors to ensure nothing clashes while the lights are changing.

### 4.2. The Dampening Function

For Glass Surfaces, the resolved Chroma is the minimum of the requested Vibrancy and the Limit.

<!-- prettier-ignore -->
1292590 C_{resolved} = \min(C_{requested}, C_{limit}) 1292590

This guarantees that no matter what the user asks for (e.g., "Neon Background"), the system mathematically clamps it to a safe, legible range.

## 5. Summary

1.  **State is Mnemonic**: $\Sigma = \langle \alpha, \nu, \tau \rangle$.
2.  **Surfaces are Topology**: Glass filters (Dampen), Solid emitters (Reset).
3.  **Safety is Geometric**: The Safe Bicone ensures text legibility by clamping Chroma based on Hue, Lightness, and Time.
4.  **Execution is Split**: Genesis solves the goals; Algebra enforces the constraints.
