<script lang="ts">
  import { builderState } from "../../../lib/state/BuilderState.svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { themeState } from "../../../lib/state/ThemeState.svelte";
  import GamutSlice from "./GamutSlice.svelte";

  let selectedId = $derived(builderState.selectedSurfaceId);
  let theme = $derived(configState.solved);

  let selectedColor = $derived.by(() => {
    if (!selectedId || !theme) return null;
    const bg = theme.backgrounds.get(selectedId);
    if (!bg) return null;
    return bg[themeState.mode];
  });
</script>

<div class="audit-view text-subtle">
  {#if selectedColor}
    <div class="gamut-container surface-card bordered">
      <h3 class="text-strong">
        Gamut Slice (Hue {Math.round(selectedColor.h)})
      </h3>
      <GamutSlice
        hue={selectedColor.h}
        l={selectedColor.l}
        c={selectedColor.c}
      />
    </div>
  {:else}
    <p>Select a surface to view its gamut position.</p>
  {/if}
</div>

<style>
  .audit-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 2rem;
  }

  .gamut-container {
    width: 100%;
    max-width: 600px;
    /* background: var(--surface-card); */
    padding: 1.5rem;
    border-radius: 8px;
    /* border: 1px solid var(--surface-bordered); */
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
</style>
