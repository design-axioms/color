---
title: Understanding APCA
---

The **Advanced Perceptual Contrast Algorithm (APCA)** is a new method for calculating contrast that aligns much closer to how the human eye actually perceives light and color.

> **Is this standard?**
> Yes. APCA is the candidate contrast method for **WCAG 3.0** (the next generation of web accessibility standards). While WCAG 2.x is the current legal baseline in many places, APCA represents the future of accessibility science. By using it, you are future-proofing your design and providing a _better_ experience for users today, even if the math is different.

Unlike the older WCAG 2.x ratio (e.g., `4.5:1`), APCA produces a score called **Lc (Lightness Contrast)**.

## Why not WCAG 2.x?

The old math was simple, but flawed. It treated all colors equally. But your eye doesn't.

### The "Font Weight" Problem

WCAG 2.x treats all text the same, regardless of how thin or thick it is. But your eye needs much more contrast to see a thin line than a thick block.

<div class="docs-grid">
  <div class="docs-p-4 docs-rounded docs-border">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <strong style="color: #15803d;">WCAG Passes (4.5:1)</strong>
      <span style="font-size: 0.8em; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px;">Passes</span>
    </div>
    <div style="font-weight: 100; font-size: 2.5rem; color: #767676; font-family: sans-serif; margin-bottom: 1rem;">
      Thin Text
    </div>
    <div class="text-subtle" style="font-size: 0.9em; line-height: 1.4;">
      Technically passes WCAG AA. <br><strong>Hard to read.</strong>
    </div>
  </div>
  <div class="docs-p-4 docs-rounded docs-border">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <strong style="color: #b45309;">WCAG Fails (3.5:1)</strong>
      <span style="font-size: 0.8em; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Fails</span>
    </div>
    <div style="font-weight: 900; font-size: 2.5rem; color: #888888; font-family: sans-serif; margin-bottom: 1rem;">
      Bold Text
    </div>
    <div class="text-subtle" style="font-size: 0.9em; line-height: 1.4;">
      Technically fails WCAG AA. <br><strong>Easy to read.</strong>
    </div>
  </div>
</div>

_APCA understands this. It would give the thin text a lower score and the bold text a higher score, matching your perception._

### The "Polarity" Problem

WCAG 2.x treats **White on Black** exactly the same as **Black on White**. But your eye doesn't.

<div class="docs-grid">
  <div class="docs-p-4 docs-rounded docs-border" style="background: white; color: black;">
    <div style="margin-bottom: 1rem;">
      <strong>Positive Polarity</strong>
      <div style="font-size: 0.8em; opacity: 0.7;">Dark on Light</div>
    </div>
    <div style="font-size: 1.1em; line-height: 1.5;">
      The eye resolves this detail very well.
    </div>
  </div>
  <div class="docs-p-4 docs-rounded docs-border" style="background: black; color: white;">
    <div style="margin-bottom: 1rem;">
      <strong>Negative Polarity</strong>
      <div style="font-size: 0.8em; opacity: 0.7;">Light on Dark</div>
    </div>
    <div style="font-size: 1.1em; line-height: 1.5;">
      The eye needs slightly <em>more</em> contrast here to avoid "halation".
    </div>
  </div>
</div>

_The Solver accounts for this. It picks slightly different lightness values for Dark Mode to ensure the perceptual contrast remains constant._

## The Lc Score

APCA outputs a score from `Lc 0` (invisible) to `Lc 106` (pure black on pure white).

| Score     | Perception          | Use Case                           |
| --------- | ------------------- | ---------------------------------- |
| **Lc 15** | Barely visible      | Watermarks, decorative borders     |
| **Lc 30** | Subtle              | Disabled text, placeholders        |
| **Lc 45** | Readable (Large)    | Large headlines, non-critical text |
| **Lc 60** | **Readable (Body)** | The gold standard for body text    |
| **Lc 75** | Preferred           | Preferred for long-form reading    |
| **Lc 90** | High Contrast       | Spotlights, critical actions       |

## Visualizing Contrast

<div class="docs-grid">
  <div class="surface-page docs-p-4 docs-rounded docs-border">
    <div style="opacity: 0.2">Lc 15 (Decorative)</div>
    <div style="opacity: 0.4">Lc 30 (Disabled)</div>
    <div style="opacity: 0.6">Lc 45 (Headlines)</div>
    <div class="text-subtle">Lc 60 (Body Text)</div>
    <div class="text-strong">Lc 90 (High Contrast)</div>
  </div>
  <div class="surface-spotlight docs-p-4 docs-rounded">
    <div style="opacity: 0.2">Lc 15 (Decorative)</div>
    <div style="opacity: 0.4">Lc 30 (Disabled)</div>
    <div style="opacity: 0.6">Lc 45 (Headlines)</div>
    <div class="text-subtle">Lc 60 (Body Text)</div>
    <div class="text-strong">Lc 90 (High Contrast)</div>
  </div>
</div>

_Note: The opacity values above are approximations for demonstration. The actual system calculates precise lightness values._