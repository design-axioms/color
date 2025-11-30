<script lang="ts">
  // Inlined math utils to ensure the visualizer works immediately
  // without waiting for package rebuilds or cache clearing.

  function binarySearch(
    min: number,
    max: number,
    evaluate: (candidate: number) => number,
    target: number,
    epsilon: number = 0.005,
    maxIterations: number = 40
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
      3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t
    );
  }

  function calculateHueShift(
    lightness: number,
    config?: {
      curve: { p1: [number, number]; p2: [number, number] };
      maxRotation: number;
    }
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
      0.001
    );

    // Calculate y (hue shift factor) given t
    const factor = cubicBezier(t, curve.p1[1], curve.p2[1]);
    return factor * maxRotation;
  }

  // State
  let p1x = $state(0.5);
  let p1y = $state(0.0);
  let p2x = $state(0.5);
  let p2y = $state(1.0);
  let maxRotation = $state(60);
  let baseHue = $state(270); // Purple

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
    return points
      .map((p) => {
        const h = baseHue + p.shift;
        return `oklch(${p.l * 100}% 0.2 ${h}deg)`;
      })
      .join(", ");
  });

  let svgPath = $derived.by(() => {
    const width = 100;
    const height = 100;
    const range = maxRotation === 0 ? 1 : maxRotation;

    return points.map((p, i) => {
      const x = p.l * width;
      const normalizedShift = p.shift / range;
      const y = height - (normalizedShift * height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");
  });
</script>

<div class="visualizer-container not-content">
  <div class="visualizer-header">
    <h3 class="text-strong">Hue Shift Playground</h3>
    <p class="text-subtle">Visualize how hue rotates across the lightness scale.</p>
  </div>

  <div class="visualizer-grid">
    <!-- Graph Section -->
    <div class="graph-section">
      <div class="graph-container">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="graph-svg">
          <!-- Background Grid -->
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border-subtle-token)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />
          
          <!-- Curve -->
          <path d={svgPath} fill="none" stroke="var(--key-brand-color)" stroke-width="2" vector-effect="non-scaling-stroke" />
          
          <!-- Control Points Visualization (Simplified) -->
          <circle cx={p1x * 100} cy={(1 - p1y) * 100} r="2" fill="var(--text-subtle-token)" vector-effect="non-scaling-stroke" />
          <circle cx={p2x * 100} cy={(1 - p2y) * 100} r="2" fill="var(--text-subtle-token)" vector-effect="non-scaling-stroke" />
          <line x1="0" y1="100" x2={p1x * 100} y2={(1 - p1y) * 100} stroke="var(--text-subtle-token)" stroke-width="1" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" opacity="0.5" />
          <line x1="100" y1="0" x2={p2x * 100} y2={(1 - p2y) * 100} stroke="var(--text-subtle-token)" stroke-width="1" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" opacity="0.5" />
        </svg>
        
        <!-- Axis Labels -->
        <div class="axis-label x-axis">Lightness (0 → 100)</div>
        <div class="axis-label y-axis">Rotation (0° → {maxRotation}°)</div>
      </div>

      <!-- Gradient Strip -->
      <div class="gradient-preview">
        <div class="gradient-strip" style:background={`linear-gradient(to right, ${gradientStops})`}></div>
        <div class="gradient-labels">
          <span>Black</span>
          <span>White</span>
        </div>
      </div>
    </div>

    <!-- Controls Section -->
    <div class="controls-section">
      <div class="control-group">
        <h4 class="control-title">Global Parameters</h4>
        
        <div class="control-item">
          <div class="control-header">
            <label for="maxRotation">Max Rotation</label>
            <span class="control-value">{maxRotation}°</span>
          </div>
          <div class="slider-container">
            <div class="slider-track"></div>
            <input type="range" id="maxRotation" min="-180" max="180" step="1" bind:value={maxRotation} class="styled-slider" />
          </div>
        </div>

        <div class="control-item">
          <div class="control-header">
            <label for="baseHue">Base Hue</label>
            <span class="control-value">{baseHue}°</span>
          </div>
          <div class="slider-container">
            <div class="slider-track" style:background={`linear-gradient(to right, oklch(0.6 0.2 0), oklch(0.6 0.2 90), oklch(0.6 0.2 180), oklch(0.6 0.2 270), oklch(0.6 0.2 360))`}></div>
            <input type="range" id="baseHue" min="0" max="360" step="1" bind:value={baseHue} class="styled-slider" />
          </div>
        </div>
      </div>

      <div class="control-group">
        <h4 class="control-title">Bezier Curve</h4>
        
        <div class="control-item">
          <div class="control-header">
            <label>P1 (Start Tension)</label>
            <span class="control-value">{p1x.toFixed(2)}, {p1y.toFixed(2)}</span>
          </div>
          <div class="dual-slider-row">
            <div class="slider-container">
              <div class="slider-track"></div>
              <input type="range" min="0" max="1" step="0.01" bind:value={p1x} class="styled-slider" title="P1 X" />
            </div>
            <div class="slider-container">
              <div class="slider-track"></div>
              <input type="range" min="0" max="1" step="0.01" bind:value={p1y} class="styled-slider" title="P1 Y" />
            </div>
          </div>
        </div>

        <div class="control-item">
          <div class="control-header">
            <label>P2 (End Tension)</label>
            <span class="control-value">{p2x.toFixed(2)}, {p2y.toFixed(2)}</span>
          </div>
          <div class="dual-slider-row">
            <div class="slider-container">
              <div class="slider-track"></div>
              <input type="range" min="0" max="1" step="0.01" bind:value={p2x} class="styled-slider" title="P2 X" />
            </div>
            <div class="slider-container">
              <div class="slider-track"></div>
              <input type="range" min="0" max="1" step="0.01" bind:value={p2y} class="styled-slider" title="P2 Y" />
            </div>
          </div>
        </div>
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
  }

  .graph-svg {
    width: 100%;
    height: 100%;
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
  }

  .gradient-strip {
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle-token);
    margin-bottom: 0.25rem;
  }

  .gradient-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: var(--text-subtle-token);
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

  .dual-slider-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
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
