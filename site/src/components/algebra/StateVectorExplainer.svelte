<script lang="ts">
  let hue = $state(280);
  let chroma = $state(0.2);
  let intentIndex = $state(0);
  let mode = $state<"light" | "dark">("light");
  let highlighted = $state<"hue" | "chroma" | "intent" | "mode" | null>(null);

  const intents = [
    { label: "High", value: "text-high", token: "text-high" },
    { label: "Subtle", value: "text-subtle", token: "text-subtle" },
    { label: "Faint", value: "text-subtlest", token: "text-subtlest" },
  ];

  let intent = $derived(intents[intentIndex]);

  // Scrubbing Logic
  let scrubbing = $state<"hue" | "chroma" | null>(null);
  let startX = 0;
  let startValue = 0;

  function startScrub(
    e: MouseEvent | TouchEvent,
    type: "hue" | "chroma",
    currentValue: number,
  ): void {
    e.preventDefault();
    scrubbing = type;
    startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    startValue = currentValue;
    window.addEventListener("mousemove", handleScrub);
    window.addEventListener("touchmove", handleScrub);
    window.addEventListener("mouseup", stopScrub);
    window.addEventListener("touchend", stopScrub);
  }

  function handleScrub(e: MouseEvent | TouchEvent): void {
    if (!scrubbing) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - startX;

    if (scrubbing === "hue") {
      hue = Math.round((startValue + delta) % 360);
      if (hue < 0) hue += 360;
    } else {
      chroma = Math.max(0, Math.min(0.3, startValue + delta * 0.001));
    }
  }

  function stopScrub(): void {
    scrubbing = null;
    window.removeEventListener("mousemove", handleScrub);
    window.removeEventListener("touchmove", handleScrub);
    window.removeEventListener("mouseup", stopScrub);
    window.removeEventListener("touchend", stopScrub);
  }

  function toggleMode(): void {
    mode = mode === "light" ? "dark" : "light";
  }

  function cycleIntent(): void {
    intentIndex = (intentIndex + 1) % intents.length;
  }
</script>

<div
  class="demo-container surface-card bordered"
  class:is-scrubbing={scrubbing !== null}
>
  <!-- The Equation -->
  <div class="equation-display">
    <math display="block">
      <mi class="text-subtle">Σ</mi>
      <mo class="text-subtle">=</mo>
      <mrow>
        <mo class="text-subtle">⟨</mo>

        <!-- Hue Scrubber -->
        <mtext>
          <span
            class="interactive-term"
            class:highlight={highlighted === "hue"}
          >
            <span class="term-stack">
              <span class="term-ghost">360°</span>
              <button
                class="term-value text-high"
                style:color={`oklch(0.7 0.2 ${hue})`}
                onmousedown={(e) => {
                  startScrub(e, "hue", hue);
                }}
                ontouchstart={(e) => {
                  startScrub(e, "hue", hue);
                }}
                onmouseenter={() => (highlighted = "hue")}
                onmouseleave={() => (highlighted = null)}
              >
                {hue}°
              </button>
            </span>
            <span class="term-label text-subtlest">Hue (Drag)</span>
          </span>
        </mtext>

        <mo class="text-subtle">,</mo>

        <!-- Chroma Scrubber -->
        <mtext>
          <span
            class="interactive-term"
            class:highlight={highlighted === "chroma"}
          >
            <span class="term-stack">
              <span class="term-ghost">0.30</span>
              <button
                class="term-value text-high"
                onmousedown={(e) => {
                  startScrub(e, "chroma", chroma);
                }}
                ontouchstart={(e) => {
                  startScrub(e, "chroma", chroma);
                }}
                onmouseenter={() => (highlighted = "chroma")}
                onmouseleave={() => (highlighted = null)}
              >
                {chroma.toFixed(2)}
              </button>
            </span>
            <span class="term-label text-subtlest">Chroma (Drag)</span>
          </span>
        </mtext>

        <mo class="text-subtle">,</mo>

        <!-- Intent Toggle -->
        <mtext>
          <span
            class="interactive-term"
            class:highlight={highlighted === "intent"}
          >
            <span class="term-stack">
              <span class="term-ghost">Subtle</span>
              <button
                class="term-value intent-value text-action"
                onclick={cycleIntent}
                onmouseenter={() => (highlighted = "intent")}
                onmouseleave={() => (highlighted = null)}
              >
                {intent.label}
              </button>
            </span>
            <span class="term-label text-subtlest">Intent (Click)</span>
          </span>
        </mtext>

        <mo class="text-subtle">,</mo>

        <!-- Mode Toggle -->
        <mtext>
          <span
            class="interactive-term"
            class:highlight={highlighted === "mode"}
          >
            <span class="term-stack">
              <span class="term-ghost">Light</span>
              <button
                class="term-value mode-value"
                class:text-warning={mode === "light"}
                class:text-brand={mode === "dark"}
                onclick={toggleMode}
                onmouseenter={() => (highlighted = "mode")}
                onmouseleave={() => (highlighted = null)}
              >
                {mode === "light" ? "Light" : "Dark"}
              </button>
            </span>
            <span class="term-label text-subtlest">Polarity (Click)</span>
          </span>
        </mtext>

        <mo class="text-subtle">⟩</mo>
      </mrow>
    </math>
  </div>

  <!-- Definitions List -->
  <div class="definitions-list">
    <div
      class="def-item"
      class:active={highlighted === "hue"}
      onmouseenter={() => (highlighted = "hue")}
      onmouseleave={() => (highlighted = null)}
    >
      <span class="math-symbol">H</span>
      <div class="def-content">
        <strong>Context Hue</strong>
        <span class="text-subtle"
          >The base hue for the current environment.</span
        >
      </div>
    </div>

    <div
      class="def-item"
      class:active={highlighted === "chroma"}
      onmouseenter={() => (highlighted = "chroma")}
      onmouseleave={() => (highlighted = null)}
    >
      <span class="math-symbol">C</span>
      <div class="def-content">
        <strong>Context Chroma</strong>
        <span class="text-subtle"
          >The base vibrancy for the current environment.</span
        >
      </div>
    </div>

    <div
      class="def-item"
      class:active={highlighted === "intent"}
      onmouseenter={() => (highlighted = "intent")}
      onmouseleave={() => (highlighted = null)}
    >
      <span class="math-symbol">L<sub>src</sub></span>
      <div class="def-content">
        <strong>Intent Lightness</strong>
        <span class="text-subtle"
          >A reference to a lightness token (e.g., text-high).</span
        >
      </div>
    </div>

    <div
      class="def-item"
      class:active={highlighted === "mode"}
      onmouseenter={() => (highlighted = "mode")}
      onmouseleave={() => (highlighted = null)}
    >
      <span class="math-symbol">α</span>
      <div class="def-content">
        <strong>Polarity</strong>
        <span class="text-subtle">The local resolved mode (Light/Dark).</span>
      </div>
    </div>
  </div>

  <!-- The Result Visualization -->
  <div class="result-container">
    <div class="arrow-container text-subtlest">
      <svg
        width="24"
        height="48"
        viewBox="0 0 24 48"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="arrow-svg"
      >
        <path d="M12 0V46M12 46L4 38M12 46L20 38" />
      </svg>
    </div>

    <div class="step-label">
      <span class="function-name text-subtle">Φ(Σ)</span>
      <span class="label-text text-subtlest">Resolution</span>
    </div>

    <div
      class="preview-card surface-card bordered {intent.value}"
      style:--base-hue={hue}
      style:--base-chroma={chroma}
      style:color-scheme={mode}
    >
      <div>
        <h3 class="preview-title">Hello World</h3>
        <p class="preview-text">This text reflects the state vector above.</p>
      </div>
    </div>
  </div>
</div>

<style>
  .demo-container {
    padding: 2rem;
    border-radius: 0.75rem;
    user-select: none;
    font-family: var(--font-body, sans-serif);
  }

  .equation-display {
    display: block;
    text-align: center;
    margin-bottom: 2rem;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 1rem;
  }

  .equation-display::-webkit-scrollbar {
    display: none;
  }

  /* MathML Styling */
  math {
    font-family: var(--font-stix-two-math), serif;
    font-size: 1.5rem;
    line-height: 1;
  }

  @media (min-width: 768px) {
    math {
      font-size: 2.25rem;
    }
  }

  mi,
  mo,
  mn,
  mtext {
    font-family: var(--font-stix-two-math), serif;
  }

  mi {
    font-style: italic;
  }

  mo {
    padding: 0 0.1em;
  }

  .interactive-term {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }

  .interactive-term.highlight {
    background-color: var(--computed-surface-highlight, rgba(255, 255, 0, 0.1));
    box-shadow: 0 0 0 4px
      var(--computed-surface-highlight, rgba(255, 255, 0, 0.1));
  }

  .term-stack {
    display: grid;
    grid-template-areas: "stack";
    align-items: center;
    justify-items: center;
  }

  .term-ghost {
    grid-area: stack;
    visibility: hidden;
    pointer-events: none;
    user-select: none;
    font-family: var(--font-stix-two-math), serif;
    font-weight: normal;
    padding: 0.25rem 0.5rem;
    font-size: inherit;
  }

  .term-value {
    grid-area: stack;
    width: 100%;
    font-family: var(--font-stix-two-math), serif;
    font-weight: normal;
    cursor: ew-resize;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    background: none;
    border: none;
    transition: background-color 0.2s;
    font-size: inherit;
  }

  .term-value:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  :global(.scheme-dark) .term-value:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .intent-value,
  .mode-value {
    cursor: pointer;
  }

  .term-label {
    position: absolute;
    bottom: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s;
    white-space: nowrap;
    pointer-events: none;
    font-family: sans-serif;
    z-index: 10;
  }

  .interactive-term:hover .term-label {
    opacity: 1;
  }

  /* Definitions List */
  .definitions-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .def-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
    cursor: default;
    transition: background-color 0.2s;
    border: 1px solid transparent;
  }

  .def-item:hover,
  .def-item.active {
    background-color: var(--computed-surface-highlight, rgba(0, 0, 0, 0.03));
    border-color: var(--computed-border-dec-color, rgba(0, 0, 0, 0.1));
  }

  :global(.scheme-dark) .def-item:hover,
  :global(.scheme-dark) .def-item.active {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .math-symbol {
    font-family: var(--font-stix-two-math), serif;
    font-size: 1.5rem;
    font-style: italic;
    width: 2.5rem;
    text-align: center;
    color: var(--computed-text-subtle);
    flex-shrink: 0;
    line-height: 1;
    margin-top: 0.125rem;
  }

  .def-content {
    display: flex;
    flex-direction: column;
    font-size: 0.875rem;
    gap: 0.25rem;
  }

  .result-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .arrow-container {
    color: var(--computed-text-subtlest);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .arrow-svg {
    display: block;
    opacity: 0.3;
    width: 2rem;
    height: 2rem;
  }

  .step-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
  }

  .label-text {
    font-family: sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.625rem;
    font-weight: bold;
    color: var(--computed-text-subtlest);
  }

  .function-name {
    font-family: var(--font-stix-two-math), serif;
    font-style: italic;
    font-size: 1.25rem;
    color: var(--computed-text-subtle);
  }

  .preview-card {
    width: 100%;
    max-width: 24rem;
    padding: 3rem 2rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s;
    --computed-fg-C: var(--base-chroma);
    --computed-fg-H: var(--base-hue);

    /* More subtle appearance */
    background-color: oklch(0.96 var(--base-chroma) var(--base-hue));
    border: 1px solid oklch(0.9 var(--base-chroma) var(--base-hue));
    box-shadow: 0 4px 20px -4px
      oklch(0.9 var(--base-chroma) var(--base-hue) / 0.5);
  }

  :global(.scheme-dark) .preview-card {
    background-color: oklch(0.2 var(--base-chroma) var(--base-hue));
    border: 1px solid oklch(0.3 var(--base-chroma) var(--base-hue));
    box-shadow: 0 4px 20px -4px
      oklch(0.1 var(--base-chroma) var(--base-hue) / 0.5);
  }

  .preview-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 0.75rem;
    letter-spacing: -0.02em;
  }

  .preview-text {
    opacity: 0.9;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 20ch;
    margin: 0 auto;
  }

  .is-scrubbing {
    cursor: ew-resize;
  }

  .is-scrubbing .interactive-term {
    pointer-events: none;
  }
</style>
