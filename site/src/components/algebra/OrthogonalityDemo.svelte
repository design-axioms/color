<script lang="ts">
  import { flip } from "svelte/animate";

  let brandHue = $state(280);
  let order = $state(["hue-brand", "text-subtle"]);

  function swap(): void {
    order = [order[1], order[0]];
  }

  // We simulate the CSS application
  // In reality, the browser handles this.
  // We want to show that the *browser* renders them the same.
</script>

<div class="demo-container">
  <div class="controls">
    <label class="control-label text-subtle">Brand Hue Definition</label>
    <input
      type="range"
      min="0"
      max="360"
      bind:value={brandHue}
      class="hue-slider accent-action"
    />
  </div>

  <div class="layout">
    <!-- The Code Editor / Class List -->
    <div class="code-block surface-card bordered">
      <div class="code-header text-subtlest">
        <span>&lt;div class="..."&gt;</span>
        <button onclick={swap} class="swap-btn text-action">Swap Order ⇄</button
        >
      </div>

      <div class="class-list">
        {#each order as cls (cls)}
          <div
            animate:flip={{ duration: 300 }}
            class="class-pill surface-card bordered"
            onclick={swap}
          >
            <span
              class="color-dot"
              class:bg-brand={cls.startsWith("hue")}
              class:bg-subtle={!cls.startsWith("hue")}
            ></span>
            {cls}
          </div>
        {/each}
      </div>

      <div class="code-footer text-subtlest">&lt;/div&gt;</div>
    </div>

    <!-- The Result -->
    <div class="result-section">
      <div class="arrow text-subtlest">→</div>

      <div
        class="preview-box surface-card bordered {order.join(' ')}"
        style:--base-hue={brandHue}
      >
        <div class="preview-content">
          <div class="preview-title">Aa</div>
          <div class="preview-subtitle">Subtle Brand Text</div>
        </div>
      </div>

      <div class="result-caption text-subtle">Result is identical</div>
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

  .controls {
    margin-bottom: 2rem;
  }

  .control-label {
    display: block;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .hue-slider {
    width: 100%;
  }

  .layout {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 768px) {
    .layout {
      flex-direction: row;
    }
  }

  .code-block {
    padding: 1.5rem;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 20rem;
  }

  .code-header {
    font-size: 0.75rem;
    font-family: monospace;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .swap-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
  }

  .swap-btn:hover {
    text-decoration: underline;
  }

  .class-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .class-pill {
    padding: 0.75rem;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-family: monospace;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .class-pill:hover {
    border-color: var(--computed-border-int-color);
  }

  .color-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
  }

  .code-footer {
    font-size: 0.75rem;
    font-family: monospace;
    margin-top: 1rem;
  }

  .result-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .arrow {
    font-size: 1.5rem;
  }

  .preview-box {
    width: 16rem;
    height: 16rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
  }

  .preview-content {
    text-align: center;
  }

  .preview-title {
    font-size: 2.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .preview-subtitle {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .result-caption {
    font-size: 0.75rem;
    font-family: monospace;
  }
</style>
