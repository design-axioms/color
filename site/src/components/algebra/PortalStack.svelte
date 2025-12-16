<script lang="ts">
  const layers = $state([{ id: 0, subtle: false }]);

  function addLayer(): void {
    if (layers.length < 5) {
      layers.push({ id: layers.length, subtle: false });
    }
  }

  function removeLayer(): void {
    if (layers.length > 1) {
      layers.pop();
    }
  }

  function toggleIntent(index: number): void {
    layers[index].subtle = !layers[index].subtle;
  }
</script>

<div class="demo-container surface-page bordered">
  <div class="header">
    <h3 class="text-strong">The Portal Stack</h3>
    <div class="controls">
      <button
        class="btn surface-action"
        class:state-disabled={layers.length >= 5}
        onclick={addLayer}
        disabled={layers.length >= 5}
      >
        Push Layer
      </button>
      <button
        class="btn surface-action"
        class:state-disabled={layers.length <= 1}
        onclick={removeLayer}
        disabled={layers.length <= 1}
      >
        Pop Layer
      </button>
    </div>
  </div>

  <div class="stack-container">
    {#snippet renderLayer(index: number)}
      {@const layer = layers[index]}
      {@const isInverse = index % 2 !== 0}

      <div
        class="layer bordered shadow-sm {isInverse
          ? 'surface-inverse'
          : 'surface-card'}"
        class:is-inverse={isInverse}
      >
        <div class="layer-header">
          <span class="layer-title text-subtle"
            >Layer {index} ({isInverse ? "Dark" : "Light"})</span
          >
          <button
            class="intent-toggle"
            class:active={layer.subtle}
            class:surface-spotlight={layer.subtle}
            onclick={() => {
              toggleIntent(index);
            }}
          >
            {layer.subtle ? "Intent: Subtle" : "Intent: High"}
          </button>
        </div>

        <div class="layer-content {layer.subtle ? 'text-subtle' : 'text-high'}">
          <p>
            The text in this layer is <strong
              >{layer.subtle ? "Subtle" : "High"}</strong
            >.
            {#if index < layers.length - 1}
              <span class="arrow">↓</span>
            {/if}
          </p>
        </div>

        {#if index < layers.length - 1}
          <div class="nested-wrapper">
            <!-- eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -->
            {@render renderLayer(index + 1)}
          </div>
        {/if}
      </div>
    {/snippet}

    <!-- eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -->
    {@render renderLayer(0)}
  </div>

  <div class="caption text-subtle">
    Notice that when you enter a new layer (Surface), the Intent resets to
    "High", even if the parent layer was set to "Subtle". The "Conversation"
    restarts.
  </div>
</div>

<style>
  .demo-container {
    padding: 2rem;
    border-radius: 1rem;
    font-family: var(--font-body, sans-serif);
  }

  .header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
  }

  .header::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: currentColor;
    opacity: 0.12;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
  }

  .btn {
    padding: 0.375rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stack-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .layer {
    padding: 1.5rem;
    border-radius: 0.75rem;
    transition: all 0.3s ease;
    position: relative;
  }

  .layer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .layer-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
    opacity: 0.7;
  }

  .intent-toggle {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid currentColor;
    background: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s;
    font-weight: 600;
  }

  .intent-toggle:hover {
    opacity: 1;
  }

  .intent-toggle.active {
    border-color: transparent;
    opacity: 1;
    font-weight: bold;
  }

  .layer-content {
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
  }

  .nested-wrapper {
    margin-top: 1.5rem;
    padding-left: 1.5rem;
    border-left: 1px solid currentColor;
    position: relative;
  }

  .nested-wrapper::before {
    content: "";
    position: absolute;
    left: -5px;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.25;
    transform: translateY(-50%);
  }

  .caption {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.875rem;
    max-width: 60ch;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
</style>
