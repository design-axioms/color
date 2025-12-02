<script lang="ts">
  // Inlined math utils to ensure the visualizer works immediately
  // without waiting for package rebuilds or cache clearing.

  function binarySearch(
    min: number,
    max: number,
    evaluate: (candidate: number) => number,
    target: number,
    epsilon: number = 0.005,
    maxIterations: number = 40,
  ): number {
    let low = min;
    let high = max;

    const valAtMin = evaluate(min);
    const valAtMax = evaluate(max);
    const slope = Math.sign(valAtMax - valAtMin) || 1;

    const minVal = Math.min(valAtMin, valAtMax);
    const maxVal = Math.max(valAtMin, valAtMax);

    if (target <= minVal + epsilon) return valAtMin <= valAtMax ? min : max;
    if (target >= maxVal - epsilon) return valAtMax >= valAtMin ? max : min;

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const val = evaluate(mid);
      const delta = val - target;

      if (Math.abs(delta) <= epsilon) {
        return mid;
      }

      if (delta * slope > 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return (low + high) / 2;
  }

  function cubicBezier(t: number, p1: number, p2: number): number {
    const oneMinusT = 1 - t;
    return (
      3 * oneMinusT * oneMinusT * t * p1 +
      3 * oneMinusT * t * t * p2 +
      t * t * t
    );
  }

  function calculateHueShift(
    lightness: number,
    config?: {
      curve: { p1: [number, number]; p2: [number, number] };
      maxRotation: number;
    },
  ): number {
    if (!config) return 0;
    const { curve, maxRotation } = config;

    // Solve for t given x (lightness)
    // x(t) = cubicBezier(t, p1x, p2x)
    const t = binarySearch(
      0,
      1,
      (val) => cubicBezier(val, curve.p1[0], curve.p2[0]),
      lightness,
      0.001,
    );

    // Calculate y (hue shift factor) given t
    const factor = cubicBezier(t, curve.p1[1], curve.p2[1]);
    return factor * maxRotation;
  }

  // State
  let p1x = $state(0.33);
  let p1y = $state(0.0);
  let p2x = $state(0.67);
  let p2y = $state(1.0);
  let maxRotation = $state(60);
  let baseHue = $state(270); // Purple
  let showControls = $state(true);

  // Dragging State
  let dragging = $state<"p1" | "p2" | null>(null);
  let svgElement: SVGSVGElement;

  // Derived
  let points = $derived.by(() => {
    const pts = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const l = i / steps;
      const shift = calculateHueShift(l, {
        curve: { p1: [p1x, p1y], p2: [p2x, p2y] },
        maxRotation,
      });
      pts.push({ l, shift });
    }
    return pts;
  });

  let gradientStops = $derived.by(() => {
    // Downsample points for the gradient string to avoid excessive length
    const stops = points
      .filter((_, i) => i % 5 === 0 || i === points.length - 1)
      .map((p) => {
        const h = baseHue + p.shift;
        const pct = Math.round(p.l * 100);

        // FIX: Use a variable chroma that tapers at the ends (black/white).
        // A fixed chroma of 0.2 at L=0 or L=100 is out-of-gamut for sRGB.
        // Browsers were crushing the chroma to 0 (grey), hiding the hue shift.
        // Using a sine wave ensures chroma is only high where it's physically possible (mid-tones).
        const chroma = 0.25 * Math.sin(p.l * Math.PI);

        return `oklch(${pct}% ${chroma.toFixed(3)} ${h.toFixed(1)}deg) ${pct}%`;
      })
      .join(", ");

    return stops;
  });

  let hueGradientStops = $derived.by(() => {
    // Constant lightness gradient to visualize hue shift purely
    // Using HSL to rule out OKLCH support issues and ensure visibility
    return points
      .filter((_, i) => i % 5 === 0 || i === points.length - 1)
      .map((p) => {
        const h = baseHue + p.shift;
        const pct = Math.round(p.l * 100);
        return `hsl(${h.toFixed(1)}deg 100% 50%) ${pct}%`;
      })
      .join(", ");
  });

  let midPointHue = $derived.by(() => {
    const midPoint = points[50]; // 50% lightness
    return baseHue + midPoint.shift;
  });

  // Coordinate Mapping
  // We map logical 0-1 to SVG 10-90 to add padding
  const PADDING = 15;
  const SIZE = 100;
  const DRAW_SIZE = SIZE - PADDING * 2;

  function toSvgX(val: number): number {
    return PADDING + val * DRAW_SIZE;
  }

  function toSvgY(val: number): number {
    return SIZE - (PADDING + val * DRAW_SIZE);
  }

  function fromSvgX(svgX: number): number {
    return Math.max(0, Math.min(1, (svgX - PADDING) / DRAW_SIZE));
  }

  function fromSvgY(svgY: number): number {
    return Math.max(0, Math.min(1, (SIZE - PADDING - svgY) / DRAW_SIZE));
  }

  let svgPath = $derived.by(() => {
    // Use native SVG Cubic Bezier command (C) for perfect smoothness
    // M startX startY C cp1x cp1y, cp2x cp2y, endX endY
    const startX = toSvgX(0);
    const startY = toSvgY(0);
    const endX = toSvgX(1);
    const endY = toSvgY(1);

    const cp1x = toSvgX(p1x);
    const cp1y = toSvgY(p1y);
    const cp2x = toSvgX(p2x);
    const cp2y = toSvgY(p2y);

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  });

  const uid = crypto.randomUUID();

  function handleMouseDown(point: "p1" | "p2"): void {
    dragging = point;
  }

  function handleMouseMove(event: MouseEvent | TouchEvent): void {
    if (!dragging) return;

    // Prevent scrolling on touch
    if (event.type === "touchmove") {
      event.preventDefault();
    }

    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const clientY =
      "touches" in event ? event.touches[0].clientY : event.clientY;

    const rect = svgElement.getBoundingClientRect();
    const svgX = (clientX - rect.left) * (SIZE / rect.width);
    const svgY = (clientY - rect.top) * (SIZE / rect.height);

    const x = fromSvgX(svgX);
    const y = fromSvgY(svgY);

    if (dragging === "p1") {
      p1x = x;
      p1y = y;
    } else {
      p2x = x;
      p2y = y;
    }
  }

  function handleMouseUp(): void {
    dragging = null;
  }
</script>

<svelte:window
  onmouseup={handleMouseUp}
  onmousemove={handleMouseMove}
  ontouchend={handleMouseUp}
  ontouchmove={handleMouseMove}
/>

<div class="visualizer-container not-content">
  <div class="visualizer-header">
    <h3 class="text-strong">Hue Shift Playground</h3>
    <p class="text-subtle">
      Visualize how hue rotates across the lightness scale.
    </p>
  </div>

  <div class="visualizer-grid">
    <!-- Graph Section -->
    <div class="graph-section">
      <div class="graph-container">
        <svg
          bind:this={svgElement}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          class="graph-svg"
        >
          <defs>
            <pattern
              id="grid-{uid}"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="var(--border-subtle-token)"
                stroke-width="0.5"
              />
            </pattern>
          </defs>
          <rect
            width="100"
            height="100"
            fill="url(#grid-{uid})"
            opacity="0.3"
          />

          <!-- Curve -->
          <path
            d={svgPath}
            fill="none"
            stroke="var(--text-high-token)"
            stroke-width="3"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />

          {#if showControls}
            <!-- Control Lines -->
            <!-- Start -> P1 -->
            <line
              x1={toSvgX(0)}
              y1={toSvgY(0)}
              x2={toSvgX(p1x)}
              y2={toSvgY(p1y)}
              stroke="var(--text-subtle-token)"
              stroke-width="1"
              stroke-dasharray="2 2"
              vector-effect="non-scaling-stroke"
              opacity="0.5"
            />
            <!-- End -> P2 -->
            <line
              x1={toSvgX(1)}
              y1={toSvgY(1)}
              x2={toSvgX(p2x)}
              y2={toSvgY(p2y)}
              stroke="var(--text-subtle-token)"
              stroke-width="1"
              stroke-dasharray="2 2"
              vector-effect="non-scaling-stroke"
              opacity="0.5"
            />

            <!-- Control Points (Interactive) -->
            <!-- P1 -->
            <circle
              cx={toSvgX(p1x)}
              cy={toSvgY(p1y)}
              r="4"
              fill="var(--surface-token)"
              stroke="var(--text-high-token)"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
              class="control-point"
              role="button"
              tabindex="0"
              aria-label="Control Point 1"
              onmousedown={() => {
                handleMouseDown("p1");
              }}
              ontouchstart={() => {
                handleMouseDown("p1");
              }}
              style:cursor={dragging ? "grabbing" : "grab"}
            />

            <!-- P2 -->
            <circle
              cx={toSvgX(p2x)}
              cy={toSvgY(p2y)}
              r="4"
              fill="var(--surface-token)"
              stroke="var(--text-high-token)"
              stroke-width="2"
              vector-effect="non-scaling-stroke"
              class="control-point"
              role="button"
              tabindex="0"
              aria-label="Control Point 2"
              onmousedown={() => {
                handleMouseDown("p2");
              }}
              ontouchstart={() => {
                handleMouseDown("p2");
              }}
              style:cursor={dragging ? "grabbing" : "grab"}
            />
          {/if}

          <!-- Start/End Points (Fixed) -->
          <circle
            cx={toSvgX(0)}
            cy={toSvgY(0)}
            r="2"
            fill="var(--text-subtle-token)"
            vector-effect="non-scaling-stroke"
          />
          <circle
            cx={toSvgX(1)}
            cy={toSvgY(1)}
            r="2"
            fill="var(--text-subtle-token)"
            vector-effect="non-scaling-stroke"
          />
        </svg>

        <!-- Axis Labels -->
        <div class="axis-label x-axis">Lightness (0 → 100)</div>
        <div class="axis-label y-axis">Rotation (0° → {maxRotation}°)</div>
      </div>

      <!-- Gradient Strip -->
      <div class="gradient-preview">
        <div class="preview-row">
          <span class="preview-label">Result</span>
          <div
            class="gradient-strip"
            style:background="linear-gradient(to right, {gradientStops})"
          ></div>
        </div>
        <div class="preview-row">
          <span class="preview-label">Hue Only</span>
          <div
            class="gradient-strip"
            style:background="linear-gradient(to right, {hueGradientStops})"
          ></div>
        </div>
        <div class="gradient-labels">
          <span>Black</span>
          <span class="mid-label">Hue at 50% L: {midPointHue.toFixed(1)}°</span>
          <span>White</span>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <div class="control-group">
        <h4 class="control-title">Global Parameters</h4>

        <div class="control-item">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={showControls} />
            Show Control Points
          </label>
        </div>

        <div class="control-item">
          <div class="control-header">
            <label for="maxRotation-{uid}">Max Rotation</label>
            <span class="control-value">{maxRotation}°</span>
          </div>
          <div class="slider-container">
            <div class="slider-track"></div>
            <input
              type="range"
              id="maxRotation-{uid}"
              min="-180"
              max="180"
              step="1"
              bind:value={maxRotation}
              class="styled-slider"
            />
          </div>
        </div>

        <div class="control-item">
          <div class="control-header">
            <label for="baseHue-{uid}">Base Hue</label>
            <span class="control-value">{baseHue}°</span>
          </div>
          <div class="slider-container">
            <div
              class="slider-track"
              style:background="linear-gradient(to right, oklch(0.6 0.2 0),
              oklch(0.6 0.2 90), oklch(0.6 0.2 180), oklch(0.6 0.2 270),
              oklch(0.6 0.2 360))"
            ></div>
            <input
              type="range"
              id="baseHue-{uid}"
              min="0"
              max="360"
              step="1"
              bind:value={baseHue}
              class="styled-slider"
            />
          </div>
        </div>
      </div>

      <!-- Bezier Sliders Removed in favor of direct manipulation -->
      <div class="control-group">
        <h4 class="control-title">Curve Values</h4>
        <div class="values-grid">
          <div class="value-item">
            <span class="label">P1</span>
            <span class="value">({p1x.toFixed(2)}, {p1y.toFixed(2)})</span>
          </div>
          <div class="value-item">
            <span class="label">P2</span>
            <span class="value">({p2x.toFixed(2)}, {p2y.toFixed(2)})</span>
          </div>
        </div>
        <p class="hint-text">
          Drag the points on the graph to adjust the curve.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .visualizer-container {
    background: var(--surface-token);
    border: 1px solid var(--border-subtle-token);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .visualizer-header h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    color: var(--text-high-token);
  }

  .visualizer-header p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-subtle-token);
  }

  .visualizer-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .visualizer-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Graph */
  .graph-container {
    position: relative;
    height: 250px;
    background: var(--surface-page-token, #f8f9fa); /* Fallback */
    border: 1px solid var(--border-subtle-token);
    border-radius: 6px;
    overflow: hidden;
    touch-action: none; /* Prevent scrolling while dragging */
  }

  .graph-svg {
    width: 100%;
    height: 100%;
    cursor: crosshair;
  }

  .control-point {
    transition: r 0.2s ease;
  }

  .control-point:hover {
    r: 6;
  }

  .axis-label {
    position: absolute;
    font-size: 0.75rem;
    color: var(--text-subtlest-token);
    font-family: monospace;
  }

  .x-axis {
    bottom: 4px;
    right: 8px;
  }

  .y-axis {
    top: 4px;
    left: 8px;
  }

  /* Gradient Preview */
  .gradient-preview {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .preview-label {
    font-size: 0.75rem;
    color: var(--text-subtle-token);
    font-weight: 600;
  }

  .gradient-strip {
    height: 32px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle-token);
  }

  .gradient-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-subtle-token);
  }

  .mid-label {
    font-family: monospace;
    color: var(--text-high-token);
  }

  /* Controls */
  .controls-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-title {
    margin: 0;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-subtle-token);
    border-bottom: 1px solid var(--border-subtle-token);
    padding-bottom: 0.5rem;
  }

  .control-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }

  .control-header label {
    color: var(--text-strong-token);
  }

  .control-value {
    font-family: monospace;
    font-size: 0.85rem;
    color: var(--text-subtle-token);
  }

  /* Values Grid */
  .values-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .value-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    background: var(--surface-page-token);
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--border-subtle-token);
  }

  .value-item .label {
    font-size: 0.75rem;
    color: var(--text-subtle-token);
    font-weight: 600;
  }

  .value-item .value {
    font-family: monospace;
    font-size: 0.9rem;
    color: var(--text-high-token);
  }

  .hint-text {
    font-size: 0.8rem;
    color: var(--text-subtle-token);
    font-style: italic;
    margin: 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-strong-token);
    cursor: pointer;
    user-select: none;
  }

  /* Custom Slider Styling (Matching DualRangeSlider) */
  .slider-container {
    position: relative;
    height: 24px;
    display: flex;
    align-items: center;
  }

  .slider-track {
    position: absolute;
    width: 100%;
    height: 4px;
    background: var(--border-subtle-token);
    border-radius: 2px;
    pointer-events: none;
  }

  .styled-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    margin: 0;
    cursor: pointer;
    position: relative;
    z-index: 1;
  }

  .styled-slider:focus {
    outline: none;
  }

  /* Thumb Styling */
  .styled-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--text-high-token);
    border: 2px solid var(--surface-token);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    margin-top: -6px; /* Center vertically relative to track if needed, but flex handles it */
  }

  .styled-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--text-high-token);
    border: 2px solid var(--surface-token);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
</style>
