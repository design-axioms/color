<script lang="ts">
  import StateProvider from "../StateProvider.svelte";
  import StyleInjector from "../StyleInjector.svelte";
  import StudioLayout from "./StudioLayout.svelte";
</script>

<StateProvider>
  <StyleInjector />
  <div class="fullscreen-studio">
    <StudioLayout />
  </div>
</StateProvider>

<style>
  .fullscreen-studio {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100; /* Higher than Starlight nav */
  }
</style>
