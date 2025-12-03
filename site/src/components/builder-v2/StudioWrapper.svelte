<script lang="ts">
  import Diagram from "../Diagram.svelte";
  import StateProvider from "../StateProvider.svelte";
  import StyleInjector from "../StyleInjector.svelte";
  import StudioLayout from "./StudioLayout.svelte";
</script>

<StateProvider>
  <StyleInjector />
  <Diagram class="fullscreen-studio">
    <StudioLayout />
  </Diagram>
</StateProvider>

<style>
  :global(.fullscreen-studio) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100; /* Higher than Starlight nav */
  }
</style>
