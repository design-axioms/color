<script lang="ts">
  let activePath = $state<"top" | "bottom" | null>(null);
</script>

<div class="demo-container surface-page bordered">
  <div class="grid-layout">
    <!-- Top Left: Base -->
    <div class="cell cell-base surface-card bordered shadow-sm">
      <div class="avatar surface-spotlight bordered">A</div>
      <div class="label text-subtle">Base</div>
    </div>

    <!-- Top Arrow -->
    <button
      type="button"
      class="arrow-container arrow-top text-subtlest"
      class:active={activePath === "top"}
      class:text-action={activePath === "top"}
      onmouseenter={() => (activePath = "top")}
      onmouseleave={() => (activePath = null)}
    >
      <span class="arrow-label surface-page preset-bordered text-subtlest">
        + Hue Brand
      </span>
      <svg class="arrow-svg" viewBox="0 0 100 24" preserveAspectRatio="none">
        <path d="M0 12H98" stroke="currentColor" stroke-width="2" />
        <path
          d="M90 4L98 12L90 20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </button>

    <!-- Top Right: Hue -->
    <div class="cell cell-hue surface-card hue-brand bordered shadow-sm">
      <div class="avatar surface-spotlight bordered">B</div>
      <div class="label text-subtle">Hue</div>
    </div>

    <!-- Left Arrow -->
    <button
      type="button"
      class="arrow-container arrow-left text-subtlest"
      class:active={activePath === "bottom"}
      class:text-action={activePath === "bottom"}
      onmouseenter={() => (activePath = "bottom")}
      onmouseleave={() => (activePath = null)}
    >
      <span
        class="arrow-label vertical surface-page preset-bordered text-subtlest"
      >
        + Text Subtle
      </span>
      <svg
        class="arrow-svg vertical"
        viewBox="0 0 24 100"
        preserveAspectRatio="none"
      >
        <path d="M12 0V98" stroke="currentColor" stroke-width="2" />
        <path
          d="M4 90L12 98L20 90"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </button>

    <!-- Right Arrow -->
    <div
      class="arrow-container arrow-right text-subtlest"
      class:active={activePath === "top"}
      class:text-action={activePath === "top"}
    >
      <span
        class="arrow-label vertical surface-page preset-bordered text-subtlest"
      >
        + Text Subtle
      </span>
      <svg
        class="arrow-svg vertical"
        viewBox="0 0 24 100"
        preserveAspectRatio="none"
      >
        <path d="M12 0V98" stroke="currentColor" stroke-width="2" />
        <path
          d="M4 90L12 98L20 90"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- Bottom Left: Subtle -->
    <div class="cell cell-subtle surface-card bordered shadow-sm text-subtle">
      <div class="avatar surface-spotlight bordered">C</div>
      <div class="label text-subtle">Subtle</div>
    </div>

    <!-- Bottom Arrow -->
    <div
      class="arrow-container arrow-bottom text-subtlest"
      class:active={activePath === "bottom"}
      class:text-action={activePath === "bottom"}
    >
      <span class="arrow-label surface-page preset-bordered text-subtlest">
        + Hue Brand
      </span>
      <svg class="arrow-svg" viewBox="0 0 100 24" preserveAspectRatio="none">
        <path d="M0 12H98" stroke="currentColor" stroke-width="2" />
        <path
          d="M90 4L98 12L90 20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- Bottom Right: Combined -->
    <div
      class="cell cell-combined surface-card hue-brand bordered shadow-sm text-subtle"
    >
      <div class="avatar surface-spotlight bordered">D</div>
      <div class="label text-subtle">Combined</div>
    </div>
  </div>

  <div class="caption text-subtle">
    Whether you apply <strong>Hue</strong> then <strong>Subtle</strong> (Top
    Path), or <strong>Subtle</strong> then <strong>Hue</strong> (Bottom Path), you
    arrive at the exact same destination.
  </div>
</div>

<style>
  .demo-container {
    padding: 3rem;
    border-radius: 0.75rem;
    font-family: var(--font-body, sans-serif);
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 120px 1fr 120px;
    grid-template-rows: 120px 1fr 120px;
    gap: 1rem;
    align-items: center;
    justify-items: center;
    max-width: 600px;
    margin: 0 auto;
  }

  .cell {
    width: 120px;
    height: 120px;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    position: relative;
    z-index: 2;
  }

  .cell:hover {
    transform: scale(1.05);
    z-index: 10;
  }

  .avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.5rem;
  }

  .arrow-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    opacity: 0.3;
    transition: all 0.3s;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .arrow-container:hover,
  .arrow-container.active {
    opacity: 1;
  }

  .arrow-svg {
    width: 100%;
    height: 24px;
    overflow: visible;
  }

  .arrow-svg.vertical {
    width: 24px;
    height: 100%;
  }

  .arrow-label {
    position: absolute;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.25rem 0.5rem;
    z-index: 1;
    white-space: nowrap;
    font-weight: bold;
  }

  .arrow-label.vertical {
    transform: rotate(-90deg);
  }

  .caption {
    margin-top: 3rem;
    text-align: center;
    font-size: 0.875rem;
    max-width: 60ch;
    margin-left: auto;
    margin-right: auto;
  }
</style>
