<script lang="ts">
  import { calcAPCA } from "apca-w3";
  import { converter, type Color } from "culori";
  import { onMount } from "svelte";

  let hue = $state(0);
  let contrastScore = $state(0);
  let hslContrastScore = $state(0);

  // Configuration
  const L_BG = 0.6; // A mid-tone background where hue shifts matter most
  const C_BG = 0.15;
  const TEXT_L = 0.98; // White text

  // Pre-calculate graph data
  let oklchPath = $state("");
  let hslPath = $state("");

  // Generate graph data on mount (client-side only)
  onMount(() => {
    const steps = 100;
    const oklchPoints: number[][] = [];
    const hslPoints: number[][] = [];

    for (let i = 0; i <= steps; i++) {
      const h = (i / steps) * 360;

      // OKLCH
      const bgOklch = { mode: "oklch" as const, l: L_BG, c: C_BG, h: h };
      const textOklch = { mode: "oklch" as const, l: TEXT_L, c: 0, h: 0 };
      const scoreOklch = getContrast(bgOklch, textOklch);
      oklchPoints.push([i, scoreOklch]);

      // HSL (Equivalent Lightness attempt)
      // We use HSL with L=60% to match the 0.6 roughly, though they are different scales.
      // To be fair, we should convert the OKLCH L=0.6 to HSL L and see the variance.
      // But usually people pick "L=60%" in HSL and expect it to be uniform.
      const bgHsl = { mode: "hsl" as const, h: h, s: 0.5, l: L_BG };
      const textHsl = { mode: "hsl" as const, h: 0, s: 0, l: TEXT_L };
      const scoreHsl = getContrast(bgHsl, textHsl);
      hslPoints.push([i, scoreHsl]);
    }

    oklchPath = pointsToPath(oklchPoints);
    hslPath = pointsToPath(hslPoints);

    updateScores();
  });

  function getContrast(bg: Color | string, text: Color | string): number {
    const bgRgb = converter("rgb")(bg);
    const textRgb = converter("rgb")(text);
    if (!bgRgb || !textRgb) return 0;
    const apca = calcAPCA(colorToInt(textRgb), colorToInt(bgRgb));
    return Math.abs(typeof apca === "number" ? apca : parseFloat(apca));
  }

  function colorToInt(c: { r: number; g: number; b: number }): number {
    return (
      (Math.round(c.r * 255) << 16) |
      (Math.round(c.g * 255) << 8) |
      Math.round(c.b * 255)
    );
  }

  function pointsToPath(points: number[][]): string {
    // Map Y (Contrast 0-100) to SVG (100-0)
    // Map X (0-100) to SVG (0-100)
    return "M " + points.map((p) => `${p[0]} ${100 - p[1]}`).join(" L ");
  }

  function updateScores(): void {
    // Current OKLCH
    const bgOklch = { mode: "oklch" as const, l: L_BG, c: C_BG, h: hue };
    const textOklch = { mode: "oklch" as const, l: TEXT_L, c: 0, h: 0 };
    contrastScore = Math.round(getContrast(bgOklch, textOklch));

    // Current HSL
    const bgHsl = { mode: "hsl" as const, h: hue, s: 0.5, l: L_BG };
    const textHsl = { mode: "hsl" as const, h: 0, s: 0, l: TEXT_L };
    hslContrastScore = Math.round(getContrast(bgHsl, textHsl));
  }

  $effect(() => {
    updateScores();
  });
</script>

<div class="demo-container surface-card">
  <!-- Graph -->
  <div class="graph-container surface-workspace">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="graph-svg">
      <!-- Grid -->
      <line
        x1="0"
        y1="50"
        x2="100"
        y2="50"
        stroke="var(--computed-border-dec-color)"
        stroke-width="0.5"
        stroke-dasharray="2 2"
      />

      <!-- HSL Line (Wavy) -->
      <path
        d={hslPath}
        fill="none"
        class="text-subtlest"
        stroke="currentColor"
        stroke-width="2"
        vector-effect="non-scaling-stroke"
        opacity="0.5"
      />

      <!-- OKLCH Line (Flat) -->
      <path
        d={oklchPath}
        fill="none"
        class="stroke-brand"
        stroke-width="3"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <!-- Cursor -->
    <div class="cursor-line" style:left="{(hue / 360) * 100}%"></div>

    <!-- Interaction Layer -->
    <input
      type="range"
      min="0"
      max="360"
      bind:value={hue}
      class="graph-input"
    />
  </div>

  <!-- Comparison Cards -->
  <div class="comparison-grid">
    <!-- OKLCH Result -->
    <div class="result-card">
      <div class="result-header">
        <span class="result-label label-oklch text-subtle text-brand"
          >Axiomatic (OKLCH)</span
        >
        <span class="result-score score-oklch text-subtle text-brand"
          >Lc {contrastScore}</span
        >
      </div>
      <div
        class="result-preview"
        style:background-color={`oklch(${L_BG} ${C_BG} ${hue})`}
        style:color="white"
      >
        <span class="preview-text">Readable</span>
      </div>
      <div class="result-desc text-subtle">
        Contrast remains constant across all hues.
      </div>
    </div>

    <!-- HSL Result -->
    <div class="result-card card-hsl">
      <div class="result-header">
        <span class="result-label text-subtle">Traditional (HSL)</span>
        <span class="result-score text-subtle">Lc {hslContrastScore}</span>
      </div>
      <div
        class="result-preview"
        style:background-color={`hsl(${hue} 50% ${L_BG * 100}%)`}
        style:color="white"
      >
        <span class="preview-text">Variable</span>
      </div>
      <div class="result-desc text-subtle">
        Contrast fluctuates wildly (Yellow is unreadable).
      </div>
    </div>
  </div>
</div>

<style>
  .demo-container {
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid var(--computed-border-dec-color);
    background: var(--computed-surface);
    user-select: none;
    font-family: var(--font-body, sans-serif);
  }

  .graph-container {
    position: relative;
    height: 14rem;
    /* We can't easily use surface-workspace here because it's inside a surface-card */
    /* But we can use the token if we must, or just use a hardcoded color for the graph bg */
    /* Or better, use the surface-workspace class on the div */
    background: var(--computed-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--computed-border-dec-color);
    margin-bottom: 2.5rem;
    overflow: hidden;
    cursor: crosshair;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .graph-svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .cursor-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--computed-fg-color);
    pointer-events: none;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }

  .graph-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: crosshair;
    margin: 0;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .comparison-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .result-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-hsl {
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .card-hsl:hover {
    opacity: 1;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0 0.25rem;
  }

  .result-label {
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-oklch {
  }

  .result-score {
    font-family: monospace;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1;
  }

  .score-oklch {
  }

  .result-preview {
    padding: 2rem;
    border-radius: 0.75rem;
    transition: background-color 0.075s;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 9rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .preview-text {
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: -0.02em;
  }

  .result-desc {
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 0 0.25rem;
  }
</style>
