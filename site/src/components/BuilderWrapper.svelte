<script lang="ts">
  import StateProvider from "./StateProvider.svelte";
  import ThemeBuilder from "./builder/ThemeBuilder.svelte";
</script>

<StateProvider>
  <div class="fullscreen-container">
    <ThemeBuilder />
  </div>
</StateProvider>

<style>
  .fullscreen-container {
    position: fixed;
    top: 3.5rem;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: var(--surface-base);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>
