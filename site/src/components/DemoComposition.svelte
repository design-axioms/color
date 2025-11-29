<script lang="ts">
  import StateProvider from './StateProvider.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<StateProvider>
  <div class="demo-container">
    <h3>Svelte 5 State Architecture Demo</h3>
    <p>
      This component demonstrates the "Classes with Runes + Context Injection" pattern.
      The <code>ThemeToggle</code> below consumes the <code>ThemeState</code> provided by this component.
    </p>
    <div class="controls">
      <ThemeToggle />
    </div>
  </div>
</StateProvider>

<style>
  .demo-container {
    padding: 1.5rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    background-color: var(--sl-color-gray-6);
  }
  
  h3 {
    margin-top: 0;
  }

  .controls {
    margin-top: 1rem;
    padding: 1rem;
    background-color: var(--sl-color-bg);
    border-radius: 0.25rem;
    border: 1px solid var(--sl-color-gray-5);
  }
</style>
