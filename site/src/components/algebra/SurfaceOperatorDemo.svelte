<script lang="ts">
  let hue = $state(150);
  let outerIntent = $state("text-subtle");
  let position = $state(0); // 0 to 100%
  let isDragging = $state(false);

  // Derived state
  let inSurface = $derived(position > 50);
  let currentIntent = $derived(inSurface ? "text-high" : outerIntent);

  // Drag logic
  let track: HTMLElement | undefined = $state();

  function handleStart(e: MouseEvent | TouchEvent): void {
    isDragging = true;
    updatePosition(e);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchend", handleEnd);
  }

  function handleMove(e: MouseEvent | TouchEvent): void {
    if (!isDragging) return;
    updatePosition(e);
  }

  function handleEnd(): void {
    isDragging = false;
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("touchmove", handleMove);
    window.removeEventListener("mouseup", handleEnd);
    window.removeEventListener("touchend", handleEnd);
  }

  function updatePosition(e: MouseEvent | TouchEvent): void {
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rawPos = (clientX - rect.left) / rect.width;
    position = Math.max(0, Math.min(100, rawPos * 100));
  }

  const titleColor =
    // eslint-disable-next-line @axiomatic-design/no-raw-tokens
    "oklch(from var(--text-lightness-source) l var(--alpha-beta) var(--alpha-hue))";
</script>

<div class="demo-container surface-card bordered">
  <!-- Controls -->
  <div class="controls">
    <div class="control-group">
      <label class="control-label text-subtle">Outer Context Hue</label>
      <input
        type="range"
        min="0"
        max="360"
        bind:value={hue}
        class="hue-slider accent-action"
      />
    </div>

    <div class="control-group">
      <label class="control-label text-subtle">Outer Intent</label>
      <div class="toggle-group surface-workspace bordered">
        <button
          class="toggle-btn"
          class:text-subtle={outerIntent !== "text-subtle"}
          class:text-strong={outerIntent === "text-subtle"}
          class:active={outerIntent === "text-subtle"}
          onclick={() => (outerIntent = "text-subtle")}>Subtle</button
        >
        <button
          class="toggle-btn"
          class:text-subtle={outerIntent !== "text-subtlest"}
          class:text-strong={outerIntent === "text-subtlest"}
          class:active={outerIntent === "text-subtlest"}
          onclick={() => (outerIntent = "text-subtlest")}>Faint</button
        >
      </div>
    </div>
  </div>

  <!-- The Stage -->
  <div class="stage bordered" style:--alpha-hue={hue} style:--alpha-beta="0.12">
    <!-- Zone 1: Ambient (Outer) -->
    <div class="zone zone-outer surface-card">
      <span class="zone-label text-subtlest">Outer Scope</span>
      <div class="zone-desc zone-desc-left text-subtle">
        Intent is preserved here.
      </div>
    </div>

    <!-- Zone 2: Surface (Inner) -->
    <div class="zone zone-inner surface-tinted">
      <span class="zone-label text-subtlest">Surface Scope</span>
      <div class="zone-desc zone-desc-right text-subtle">
        Intent is reset here (The Glass Box).
      </div>
    </div>

    <!-- The Draggable Element -->
    <div
      bind:this={track}
      class="track"
      onmousedown={handleStart}
      ontouchstart={handleStart}
    >
      <!-- The Element Itself -->
      <div
        class="element surface-card bordered shadow-md {currentIntent}-token"
        style:left="{position}%"
      >
        <div class="avatar surface-workspace">👤</div>
        <div class="text-content">
          <div class="element-title" style:color={titleColor}>Hello World</div>
          <div class="element-subtitle text-subtlest">
            {currentIntent}
          </div>
        </div>

        <!-- State Badge -->
        <div class="state-badge bg-strong text-inverse">
          {inSurface ? "Reset" : "Inherit"}
        </div>
      </div>
    </div>
  </div>

  <div class="caption text-subtle">
    Drag the card across the boundary. Notice how the text style resets inside
    the Surface, but the Hue (Context) persists.
  </div>
</div>

<style>
  .demo-container {
    padding: 2rem;
    border-radius: 0.75rem;
    user-select: none;
    font-family: var(--font-body, sans-serif);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 3rem;
    justify-content: center;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    display: block;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .hue-slider {
    width: 12rem;
  }

  .toggle-group {
    display: flex;
    border-radius: 0.25rem;
    padding: 0.25rem;
  }

  .toggle-btn {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    transition: all 0.2s;
    background: none;
    border: none;
    cursor: pointer;
  }

  .toggle-btn:hover {
    /* We rely on text-high inheritance or just opacity change */
    opacity: 0.8;
  }

  .toggle-btn.active {
    background: var(--computed-surface);
    box-shadow: var(--shadow-sm);
  }

  .stage {
    position: relative;
    height: 18rem;
    display: flex;
    gap: 0.5rem; /* Add gap between zones */
    margin-bottom: 1rem;
  }

  .zone {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 1.5rem;
    position: relative;
    border-radius: 0.5rem; /* Round corners individually */
    background-color: var(--computed-surface); /* Default background */
    border: 1px dashed var(--computed-border-dec-color);
  }

  .zone-outer {
    background-color: oklch(
      from var(--computed-surface) l 0.02 var(--alpha-hue) / 0.3
    );
    border-right: none;
  }

  .zone-inner {
    background-color: oklch(
      from var(--computed-surface) l 0.05 140 / 0.1
    ); /* Subtle green tint */
    transition: background-color 0.3s;
    border-left: none;
  }

  .zone-label {
    font-size: 0.625rem;
    font-family: sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 0.5rem;
    opacity: 0.6;
    font-weight: bold;
  }

  .zone-desc {
    position: absolute;
    top: 1.5rem;
    font-size: 0.875rem;
    max-width: 180px;
    line-height: 1.4;
  }

  .zone-desc-left {
    left: 1.5rem;
    text-align: left;
  }

  .zone-desc-right {
    right: 1.5rem;
    text-align: right;
  }

  .track {
    position: absolute;
    inset: 0;
    cursor: ew-resize;
    z-index: 10;
  }

  .element {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    border-radius: 1rem;
    transition: transform 0.075s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    pointer-events: none;
    width: 180px;
    background: var(--computed-surface);
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
  }

  .avatar {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 9999px;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .text-content {
    text-align: center;
    width: 100%;
  }

  .element-title {
    font-weight: 800;
    font-size: 1.25rem;
    line-height: 1.2;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .element-subtitle {
    font-size: 0.75rem;
    font-family: monospace;
    opacity: 0.7;
  }

  .state-badge {
    position: absolute;
    bottom: -0.75rem; /* Move to bottom */
    top: auto;
    font-size: 0.625rem;
    font-weight: bold;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .caption {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.875rem;
  }
</style>
