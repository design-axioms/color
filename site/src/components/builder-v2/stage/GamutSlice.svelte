<script lang="ts">
  import { getMaxChroma } from "../../../lib/utils/gamut";

  let { hue, l, c } = $props<{ hue: number; l: number; c: number }>();

  const RESOLUTION = 20; // Points per curve

  let p3Path = $derived.by(() => {
    let d = "M 0 40"; // Start bottom-left
    for (let i = 0; i <= 100; i += 100 / RESOLUTION) {
      const maxC = getMaxChroma(i / 100, hue, "p3");
      const y = 40 - maxC * 100;
      d += ` L ${i} ${y}`;
    }
    d += " L 100 40 Z"; // Close at bottom-right
    return d;
  });

  let srgbPath = $derived.by(() => {
    let d = "M 0 40";
    for (let i = 0; i <= 100; i += 100 / RESOLUTION) {
      const maxC = getMaxChroma(i / 100, hue, "rgb");
      const y = 40 - maxC * 100;
      d += ` L ${i} ${y}`;
    }
    d += " L 100 40 Z";
    return d;
  });
</script>

<div class="gamut-slice">
  <svg viewBox="0 0 100 40" preserveAspectRatio="none">
    <!-- P3 Gamut -->
    <path d={p3Path} class="gamut p3" />

    <!-- sRGB Gamut -->
    <path d={srgbPath} class="gamut srgb" />

    <!-- Current Point -->
    <circle
      cx={l * 100}
      cy={40 - c * 100}
      r="1.5"
      class="current-point"
      vector-effect="non-scaling-stroke"
    />
  </svg>
  <div class="labels">
    <span>L: {Math.round(l * 100)}%</span>
    <span>C: {c.toFixed(3)}</span>
  </div>
</div>

<style>
  .gamut-slice {
    width: 100%;
    height: 100px;
    background: var(--surface-sunken);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .gamut {
    stroke: none;
  }

  .gamut.p3 {
    fill: var(--surface-subtle);
    opacity: 0.3;
  }

  .gamut.srgb {
    fill: var(--surface-subtle);
    opacity: 0.5;
  }

  .current-point {
    fill: var(--text-high-token);
    stroke: var(--surface-page);
    stroke-width: 1px;
  }

  .labels {
    position: absolute;
    bottom: 4px;
    left: 4px;
    font-size: 0.7rem;
    font-family: var(--font-mono);
    color: var(--text-subtle-token);
    pointer-events: none;
    display: flex;
    gap: 0.5rem;
  }
</style>
