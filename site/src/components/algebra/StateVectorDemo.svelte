<script lang="ts">
  let hue = $state(280);
  let chroma = $state(0.2);
  let intentIndex = $state(0);
  let mode = $state<"light" | "dark">("light");

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
      // Sensitivity: 1px = 1deg
      hue = Math.round((startValue + delta) % 360);
      if (hue < 0) hue += 360;
    } else {
      // Sensitivity: 1px = 0.001
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
          <span class="interactive-term">
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
          <span class="interactive-term">
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
          <span class="interactive-term">
            <span class="term-stack">
              <span class="term-ghost">Subtle</span>
              <button
                class="term-value intent-value text-action"
                onclick={cycleIntent}
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
          <span class="interactive-term">
            <span class="term-stack">
              <span class="term-ghost">Light</span>
              <button
                class="term-value mode-value"
                class:text-warning={mode === "light"}
                class:text-brand={mode === "dark"}
                onclick={toggleMode}
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
      style:--alpha-hue={hue}
      style:--alpha-beta={chroma}
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
    margin-bottom: 3rem;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    padding-bottom: 2rem; /* Prevent clipping of tooltips */
  }

  .equation-display::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
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
    font-family: var(--font-stix-two-math), serif;
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
    /* We can't easily use .surface-workspace here because it resets text color */
    /* But we can use a semi-transparent background which is what surface-workspace essentially is */
    /* Actually, let's just use a hardcoded fallback for hover if we can't use a token */
    /* Or better, use the token via a class if we had one */
    /* For now, I'll leave the hover effect as a slight opacity change or similar if I can't use a token */
    background-color: rgba(0, 0, 0, 0.05);
  }

  /* Dark mode hover adjustment */
  :global(.scheme-dark) .term-value:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .intent-value {
    font-family: var(--font-stix-two-math), serif;
    cursor: pointer;
  }

  .mode-value {
    font-family: var(--font-stix-two-math), serif;
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

  .result-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .arrow-container {
    /* color handled by class */
  }

  .arrow-svg {
    display: block;
    opacity: 0.5;
  }

  .step-label {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .label-text {
    font-family: sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .function-name {
    font-family: var(--font-stix-two-math), serif;
    font-style: italic;
  }

  .preview-card {
    width: 100%;
    max-width: 28rem;
    padding: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.3s;

    /* 
       We manually construct the color to match the engine's logic 
       BUT we can rely on the engine's classes now!
       The .text-high / .text-subtle classes set --text-lightness-source
       The engine calculates color: var(--computed-fg-color)
       We just need to ensure --computed-fg-C and --computed-fg-H are set.
       The engine sets them from --alpha-beta and --alpha-hue (which we set in style)
    */

    --computed-fg-C: var(--alpha-beta);
    --computed-fg-H: var(--alpha-hue);
  }

  .preview-title {
    font-size: 1.875rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .preview-text {
    opacity: 0.8;
  }

  /* Scrubbing State */
  .is-scrubbing {
    cursor: ew-resize;
  }

  .is-scrubbing .interactive-term {
    pointer-events: none;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  /* Keep the active term fully opaque */
  /* Note: :has() support is good but we can also use a more specific selector if needed */
  /* Since we can't easily target the "active" one without more state, we'll just dim everything slightly */
  /* and rely on the cursor to indicate activity. */
  /* Actually, let's just disable pointer events to prevent the crossover bug. */
  .is-scrubbing .interactive-term {
    pointer-events: none;
  }
</style>
