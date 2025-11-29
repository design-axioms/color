<script lang="ts">
  import { getContext } from 'svelte';
  import type { ConfigState } from '../../lib/state/ConfigState.svelte';
  import type { ThemeState } from '../../lib/state/ThemeState.svelte';
  import DualRangeSlider from './DualRangeSlider.svelte';
  import LightnessScale from './LightnessScale.svelte';
  import { contrastForPair, textLightness } from '@algebraic-systems/color-system/math';

  const configState = getContext<ConfigState>('config');
  const themeState = getContext<ThemeState>('theme');

  let config = $derived(configState.config);
  let solved = $derived(configState.solved);
  let resolvedTheme = $derived(themeState.mode);

  function getFailingSurfaces(polarity: "page" | "inverted", mode: "light" | "dark") {
    if (!solved) return 0;
    return solved.surfaces.filter((s) => {
      if (s.polarity !== polarity) return false;
      const bg = s.computed?.[mode].background;
      if (bg === undefined) return false;
      const textL = textLightness({ polarity, mode });
      const contrast = contrastForPair(textL, bg);
      return contrast < 45;
    }).length;
  }

  function getLockReason(polarity: "page" | "inverted", position: "start" | "end") {
    if (polarity === "inverted" && position === "end") {
      return "Locked to Brand Color lightness";
    }
    return "Locked by default configuration (editable in config)";
  }
</script>

<div style="display: flex; flex-direction: column; gap: 2rem;">
  <LightnessScale />
  
  <div>
    <h3 class="text-strong" style="margin-bottom: 1rem;">Page Anchors</h3>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      {@render RangeControl("page", "light")}
      {@render RangeControl("page", "dark")}
    </div>
  </div>

  <div>
    <h3 class="text-strong" style="margin-bottom: 1rem;">Inverted Anchors</h3>
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      {@render RangeControl("inverted", "light")}
      {@render RangeControl("inverted", "dark")}
    </div>
  </div>
</div>

{#snippet RangeControl(polarity: "page" | "inverted", mode: "light" | "dark")}
  {@const startAnchor = config.anchors[polarity][mode].start}
  {@const endAnchor = config.anchors[polarity][mode].end}
  {@const isActive = mode === resolvedTheme}
  {@const failingCount = getFailingSurfaces(polarity, mode)}
  {@const startLocked = !startAnchor.adjustable}
  {@const endLocked = !endAnchor.adjustable}

  <div
    style:opacity={isActive ? 1 : 0.5}
    style:transition="opacity 0.2s ease"
    style:display="flex"
    style:flex-direction="column"
    style:gap="0.5rem"
  >
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="text-strong" style="text-transform: capitalize;">
        {mode}
        {#if failingCount > 0}
          <span
            title={`${failingCount} surfaces have insufficient contrast`}
            style="margin-left: 0.5rem; cursor: help;"
          >
            ⚠️
          </span>
        {/if}
      </span>
    </div>

    <div
      style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-subtle-token);"
    >
      <div style="display: flex; align-items: center; gap: 0.25rem;">
        <span>Start: {startAnchor.background.toFixed(2)}</span>
        {#if startLocked}
          <span
            title={getLockReason(polarity, "start")}
            style="cursor: help; font-size: 0.8rem;"
          >
            🔒
          </span>
        {/if}
      </div>
      <div style="display: flex; align-items: center; gap: 0.25rem;">
        <span>End: {endAnchor.background.toFixed(2)}</span>
        {#if endLocked}
          <span
            title={getLockReason(polarity, "end")}
            style="cursor: help; font-size: 0.8rem;"
          >
            🔒
          </span>
        {/if}
      </div>
    </div>

    <DualRangeSlider
      start={startAnchor.background}
      end={endAnchor.background}
      startLocked={startLocked}
      endLocked={endLocked}
      onStartChange={(val) => configState.updateAnchor(polarity, mode, "start", val)}
      onEndChange={(val) => configState.updateAnchor(polarity, mode, "end", val)}
      startLabel={`${mode} Start`}
      endLabel={`${mode} End`}
    />
  </div>
{/snippet}
