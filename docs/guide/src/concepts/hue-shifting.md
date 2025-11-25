# Hue Shifting

## Why Non-Linear Hue Shifting?

The color system supports optional **hue rotation** across the lightness spectrum. This feature allows surfaces to shift from cooler tones in darker regions to warmer tones in lighter regions (or vice versa), creating a more dynamic and perceptually harmonious color palette.

### The Problem with Linear Shifting

A naive implementation might apply hue rotation linearly:

```typescript
// Linear shift (NOT what we do)
const hueShift = lightness * maxRotation;
```

However, this doesn't match human perception. Our eyes perceive warmth and coolness non-linearly across the lightness spectrum. A linear shift can feel abrupt or unnatural, especially in the mid-tones.

## Cubic Bezier Solution

Instead, we use a **cubic Bezier curve** to map lightness values (0-1) to hue rotation factors (0-1):

```typescript
function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
  );
}

export function calculateHueShift(
  lightness: number,
  config?: HueShiftConfig
): number {
  if (!config) return 0;
  const { curve, maxRotation } = config;
  const factor = cubicBezier(lightness, curve.p1[1], curve.p2[1]);
  return factor * maxRotation;
}
```

### Control Points

The default configuration uses control points that create an S-curve:

```json
{
  "hueShift": {
    "curve": {
      "p1": [0.5, 0],
      "p2": [0.5, 1]
    },
    "maxRotation": 180
  }
}
```

#### What These Mean

- **P1: `[0.5, 0]`**: First control point at 50% horizontally, 0% vertically
- **P2: `[0.5, 1]`**: Second control point at 50% horizontally, 100% vertically

This creates a **smooth S-curve** that:

1. **Starts slowly** at lightness = 0 (minimal hue shift in darks)
2. **Accelerates through mid-tones** (where our eyes are most sensitive)
3. **Finishes smoothly** at lightness = 1 (full rotation in lights)

### Visual Comparison

```
Lightness →  0.0    0.25   0.5    0.75   1.0
------------ ----- ------ ------ ------ ------
Linear:        0°    45°    90°   135°   180°
Bezier:        0°    ~15°   90°   ~165°  180°
```

Notice how the Bezier curve:

- **Flattens** at the extremes (smoother transitions in very dark/light)
- **Steepens** in the middle (more dramatic shift where it matters)

### Perceptual Benefits

1. **Natural Warmth Progression**: Mimics how we perceive natural lighting (cool shadows → neutral midtones → warm highlights)

2. **Better Mid-Tone Separation**: The steeper middle section ensures distinct hue differences between closely-spaced surfaces in the mid-lightness range (where most UI elements live)

3. **Smooth Extremes**: The flatter curves at 0 and 1 prevent jarring hue jumps in already-extreme lightness values

### Customization

You can customize the curve by adjusting the control points:

```json
{
  "hueShift": {
    "curve": {
      "p1": [0.3, 0], // Shift acceleration point earlier
      "p2": [0.7, 1] // Shift deceleration point later
    },
    "maxRotation": 120 // Less dramatic overall shift
  }
}
```

**Experiment with:**

- Moving P1/P2 horizontally to change where the acceleration happens
- Moving P1/P2 vertically to create asymmetric curves
- Adjusting `maxRotation` for subtler or more dramatic effects

### Implementation Note

The cubic Bezier implementation assumes the curve starts at `(0,0)` and ends at `(1,1)`, with only the middle two control points configurable. This constraint ensures the hue shift is always 0° at lightness 0 and `maxRotation` at lightness 1, providing predictable behavior while allowing artistic control over the interpolation.

## Related Concepts

- **OKLCH Color Space**: Hue rotations happen in the perceptually uniform OKLCH space, ensuring equal visual impact across the spectrum
- **Chroma Independence**: Hue shifts don't affect saturation, maintaining consistent vibrancy
- **CSS `@property`**: Registered custom properties allow smooth animated transitions between hue-shifted values
