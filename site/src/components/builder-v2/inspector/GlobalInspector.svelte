<script lang="ts">
  // Global Inspector: Controls for system-wide parameters (Anchors, Key Colors).
</script>

<div class="inspector-section">
  <h3>Anchors</h3>
  <div class="control-group">
    <label>
      <span>Light Mode Base (L*)</span>
      <input type="range" min="0" max="100" value="98" />
    </label>
    <label>
      <span>Dark Mode Base (L*)</span>
      <input type="range" min="0" max="100" value="10" />
    </label>
  </div>
</div>

<div class="inspector-section">
  <h3>Key Colors</h3>
  <div class="control-group">
    <label>
      <span>Primary Hue</span>
      <input type="color" value="#3b82f6" />
    </label>
    <label>
      <span>Secondary Hue</span>
      <input type="color" value="#10b981" />
    </label>
  </div>
</div>

<div class="inspector-section">
  <h3>Hue Shift</h3>
  <p class="text-subtle">Curve controls coming soon.</p>
</div>

<style>
  .inspector-section {
    padding: 1rem;
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--sl-color-text-accent);
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  input[type="range"] {
    width: 100%;
  }

  .text-subtle {
    font-size: 0.8rem;
    color: var(--sl-color-gray-4);
  }
</style>
