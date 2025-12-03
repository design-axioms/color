<script lang="ts">
  import { converter, displayable, formatHex } from "culori";
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";

  interface Props {
    hue?: number;
    highlightSlug?: string | null;
  }

  let { hue = 0, highlightSlug = null }: Props = $props();

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let solved = $derived(configState.solved);
  let resolvedTheme = $derived(themeState.mode);

  let canvas: HTMLCanvasElement | undefined;
  const width = 300;
  const height = 200;
  const maxChroma = 0.35; // OKLCH chroma usually goes up to ~0.33 for sRGB

  const toRgb = converter("rgb");

  function drawGamut(): void {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      const l = 1 - y / height; // Lightness 1 at top, 0 at bottom
      for (let x = 0; x < width; x++) {
        const c = (x / width) * maxChroma;

        const color = { mode: "oklch" as const, l, c, h: hue };

        // Check if color is within sRGB gamut
        if (displayable(color)) {
          const rgb = toRgb(color);
          const index = (y * width + x) * 4;
          data[index] = rgb.r * 255;
          data[index + 1] = rgb.g * 255;
          data[index + 2] = rgb.b * 255;
          data[index + 3] = 255;
        } else {
          // Transparent
          const index = (y * width + x) * 4;
          data[index + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  $effect(() => {
    drawGamut();
  });

  // Filter surfaces that are close to this hue
  let relevantSurfaces = $derived.by(() => {
    if (!solved) return [];
    const surfaces = [];
    for (const [slug, modes] of solved.backgrounds) {
      const color = modes[resolvedTheme];
      // Check if hue is within +/- 15 degrees (handling wrap around)
      const diff = Math.abs(color.h - hue);
      const wrappedDiff = Math.min(diff, 360 - diff);

      if (wrappedDiff < 15 || color.c < 0.02) {
        // Include neutrals
        surfaces.push({ slug, color });
      }
    }
    return surfaces;
  });
</script>

<div class="gamut-slice surface-workspace bordered">
  <div class="canvas-container bordered">
    <canvas bind:this={canvas} {width} {height}></canvas>

    <!-- Overlay Points -->
    {#each relevantSurfaces as { slug, color } (slug)}
      {@const x = (color.c / maxChroma) * width}
      {@const y = (1 - color.l) * height}
      {@const isHighlighted = slug === highlightSlug}

      <div
        class="point {isHighlighted ? 'highlighted border-highlight' : ''}"
        style="left: {x}px; top: {y}px; background-color: {formatHex({
          mode: 'oklch',
          ...color,
        })};"
        title="{slug} (L: {color.l.toFixed(2)}, C: {color.c.toFixed(3)})"
      ></div>
    {/each}
  </div>

  <div class="labels text-subtle">
    <span class="y-label top">L=100</span>
    <span class="y-label bottom">L=0</span>
    <span class="x-label left">C=0</span>
    <span class="x-label right">C={maxChroma}</span>
  </div>
</div>

<style>
  .gamut-slice {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .canvas-container {
    position: relative;
    width: 300px;
    height: 200px;
    background: repeating-conic-gradient(#eee 0% 25%, white 0% 50%) 50% / 20px
      20px; /* Checkerboard */
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .point {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid white;
    transform: translate(-50%, -50%);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    pointer-events: none; /* Let hover pass through to canvas/container if needed */
  }

  .point.highlighted {
    width: 12px;
    height: 12px;
    z-index: 10;
  }

  .labels {
    position: relative;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  .y-label {
    position: absolute;
    left: -2.5rem;
  }
  .y-label.top {
    top: -200px;
  }
  .y-label.bottom {
    bottom: 0;
  } /* Relative to labels container, this is tricky. Better to just put X labels here */

  .x-label {
    position: absolute;
    bottom: 0;
  }
  .x-label.left {
    left: 0;
  }
  .x-label.right {
    right: 0;
  }
</style>
