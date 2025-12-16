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

  interface Props {
    curve?: { p1: [number, number]; p2: [number, number] };
    maxRotation?: number;
    baseHue?: number;
    showControls?: boolean;
    onUpdate?: () => void;
  }

  /* eslint-disable prefer-const */
  let {
    curve = $bindable({ p1: [0.33, 0.0], p2: [0.67, 1.0] }),
    maxRotation = $bindable(60),
    baseHue = $bindable(270),
    showControls = $bindable(true),
    onUpdate,
  }: Props = $props();
  /* eslint-enable prefer-const */

  // Dragging State
  let dragging = $state<"p1" | "p2" | null>(null);
  let svgElement: SVGSVGElement;

  // Derived
  const points = $derived.by(() => {
    const pts = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const l = i / steps;
      const shift = calculateHueShift(l, {
        curve,
        maxRotation,
      });
      pts.push({ l, shift });
    }
    return pts;
  });

  const midPointHue = $derived.by(() => {
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

  const svgPath = $derived.by(() => {
    // Use native SVG Cubic Bezier command (C) for perfect smoothness
    // M startX startY C cp1x cp1y, cp2x cp2y, endX endY
    const startX = toSvgX(0);
    const startY = toSvgY(0);
    const endX = toSvgX(1);
    const endY = toSvgY(1);

    const cp1x = toSvgX(curve.p1[0]);
    const cp1y = toSvgY(curve.p1[1]);
    const cp2x = toSvgX(curve.p2[0]);
    const cp2y = toSvgY(curve.p2[1]);

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
      curve.p1[0] = x;
      curve.p1[1] = y;
    } else {
      curve.p2[0] = x;
      curve.p2[1] = y;
    }
    onUpdate?.();
  }

  function handleMouseUp(): void {
    dragging = null;
  }

  const sliderGradient =
    "linear-gradient(to right, red, orange, yellow, green, blue, purple, red)";

  const previewGradient = sliderGradient;
</script>

<svelte:window
  onmouseup={handleMouseUp}
  onmousemove={handleMouseMove}
  ontouchend={handleMouseUp}
  ontouchmove={handleMouseMove}
/>

<div class="visualizer-container not-content surface-card bordered">
  <div class="visualizer-header">
    <h3 class="text-strong">Hue Shift Playground</h3>
    <p class="text-subtle">
      Visualize how hue rotates across the lightness scale.
    </p>
  </div>

  <div class="visualizer-grid">
    <!-- Graph Section -->
    <div class="graph-section">
      <div class="graph-container surface-workspace bordered">
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
                stroke="currentColor"
                stroke-width="0.5"
                opacity="0.25"
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
            stroke="currentColor"
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
              x2={toSvgX(curve.p1[0])}
              y2={toSvgY(curve.p1[1])}
              stroke="currentColor"
              stroke-width="1"
              stroke-dasharray="2 2"
              vector-effect="non-scaling-stroke"
              opacity="0.5"
            />
            <!-- End -> P2 -->
            <line
              x1={toSvgX(1)}
              y1={toSvgY(1)}
              x2={toSvgX(curve.p2[0])}
              y2={toSvgY(curve.p2[1])}
              stroke="currentColor"
              stroke-width="1"
              stroke-dasharray="2 2"
              vector-effect="non-scaling-stroke"
              opacity="0.5"
            />

            <!-- Control Points (Visual Only) -->
            <!-- P1 and P2 circles removed to prevent oval distortion.
                 The .control-handle buttons now provide the visual representation. -->
          {/if}

          <!-- Start/End Points (Fixed) -->
          <!-- Removed SVG circles to prevent oval distortion.
               Replaced with HTML elements in the overlay below. -->
        </svg>

        <!-- Fixed Start/End Points (HTML to avoid SVG distortion) -->
        <div class="controls-overlay">
          <!-- Start Point -->
          <div
            class="fixed-point"
            style:left="{toSvgX(0)}%"
            style:top="{toSvgY(0)}%"
          ></div>

          <!-- End Point -->
          <div
            class="fixed-point"
            style:left="{toSvgX(1)}%"
            style:top="{toSvgY(1)}%"
          ></div>

          {#if showControls}
            <!-- Interactive Overlay -->
            <!-- P1 Button -->
            <button
              type="button"
              class="control-handle ring-focus-visible"
              style:left="{toSvgX(curve.p1[0])}%"
              style:top="{toSvgY(curve.p1[1])}%"
              style:cursor={dragging ? "grabbing" : "grab"}
              aria-label="Control Point 1"
              onmousedown={() => {
                handleMouseDown("p1");
              }}
              ontouchstart={() => {
                handleMouseDown("p1");
              }}
            ></button>

            <!-- P2 Button -->
            <button
              type="button"
              class="control-handle ring-focus-visible"
              style:left="{toSvgX(curve.p2[0])}%"
              style:top="{toSvgY(curve.p2[1])}%"
              style:cursor={dragging ? "grabbing" : "grab"}
              aria-label="Control Point 2"
              onmousedown={() => {
                handleMouseDown("p2");
              }}
              ontouchstart={() => {
                handleMouseDown("p2");
              }}
            ></button>
          {/if}
        </div>

        <!-- Axis Labels -->
        <div class="axis-label x-axis text-subtle">Lightness (0 → 100)</div>
        <div class="axis-label y-axis text-subtle">
          Rotation (0° → {maxRotation}°)
        </div>
      </div>

      <!-- Gradient Strip -->
      <div class="gradient-preview">
        <div class="preview-row">
          <span class="preview-label text-subtle">Palette Preview</span>
          <div class="gradient-strip" style:background={previewGradient}></div>
        </div>
        <div class="gradient-labels text-subtle">
          <span>Low</span>
          <span class="mid-label text-strong"
            >Hue at 50% L: {midPointHue.toFixed(1)}°</span
          >
          <span>High</span>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <div class="control-group">
        <h4 class="control-title text-subtle">Global Parameters</h4>

        <div class="control-item">
          <label class="checkbox-label text-strong">
            <input type="checkbox" bind:checked={showControls} />
            Show Control Points
          </label>
        </div>

        <div class="control-item">
          <div class="control-header">
            <label for="maxRotation-{uid}" class="text-strong"
              >Max Rotation</label
            >
            <span class="control-value text-subtle">{maxRotation}°</span>
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
            <label for="baseHue-{uid}" class="text-strong">Base Hue</label>
            <span class="control-value text-subtle">{baseHue}°</span>
          </div>
          <div class="slider-container">
            <div class="slider-track" style:background={sliderGradient}></div>
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
        <h4 class="control-title text-subtle">Curve Values</h4>
        <div class="values-grid">
          <div class="value-item surface-workspace bordered">
            <span class="label text-subtle">P1</span>
            <span class="value text-strong"
              >({curve.p1[0].toFixed(2)}, {curve.p1[1].toFixed(2)})</span
            >
          </div>
          <div class="value-item surface-workspace bordered">
            <span class="label text-subtle">P2</span>
            <span class="value text-strong"
              >({curve.p2[0].toFixed(2)}, {curve.p2[1].toFixed(2)})</span
            >
          </div>
        </div>
        <p class="hint-text text-subtle">
          Drag the points on the graph to adjust the curve.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .visualizer-container {
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .visualizer-header h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
  }

  .visualizer-header p {
    margin: 0;
    font-size: 0.9rem;
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
    border-radius: 6px;
    overflow: hidden;
    touch-action: none; /* Prevent scrolling while dragging */
  }

  .graph-svg {
    width: 100%;
    height: 100%;
    cursor: crosshair;
    color: currentColor;
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

  .controls-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .control-handle {
    position: absolute;
    width: 16px;
    height: 16px;
    transform: translate(-50%, -50%);
    background: Canvas;
    border: 2px solid CanvasText;
    border-radius: 50%;
    cursor: grab;
    pointer-events: auto;
    padding: 0;
    transition: transform 0.1s ease;
  }

  .control-handle:hover,
  .control-handle:focus-visible {
    transform: translate(-50%, -50%) scale(1.2);
  }

  .control-handle:active {
    cursor: grabbing;
  }

  .fixed-point {
    position: absolute;
    width: 8px;
    height: 8px;
    transform: translate(-50%, -50%);
    background: CanvasText;
    border-radius: 50%;
    pointer-events: none;
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
    font-weight: 600;
  }

  .gradient-strip {
    height: 32px;
    border-radius: 4px;
    border: 1px solid CanvasText;
  }

  .gradient-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
  }

  .mid-label {
    font-family: monospace;
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
    border-bottom: 1px solid CanvasText;
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

  .control-value {
    font-family: monospace;
    font-size: 0.85rem;
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
    padding: 0.5rem;
    border-radius: 4px;
  }

  .value-item .label {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .value-item .value {
    font-family: monospace;
    font-size: 0.9rem;
  }

  .hint-text {
    font-size: 0.8rem;
    font-style: italic;
    margin: 0;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
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
    background: CanvasText;
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

  /* Track Styling for WebKit to ensure consistent height for thumb centering */
  .styled-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  /* Thumb Styling */
  .styled-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: CanvasText;
    border: 2px solid Canvas;
    margin-top: 4px; /* (24px track - 16px thumb) / 2 */
  }

  .styled-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: CanvasText;
    border: 2px solid Canvas;
  }
</style>
