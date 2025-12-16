<script lang="ts">
  import { builderState } from "../../../lib/state/BuilderState.svelte";
  import { configState } from "../../../lib/state/ConfigState.svelte";
  import { themeState } from "../../../lib/state/ThemeState.svelte";

  const hoveredId = $derived(builderState.hoveredSurfaceId);

  const trace = $derived.by(() => {
    if (!hoveredId) return null;

    // Find surface and group
    for (const group of configState.config.groups) {
      const surface = group.surfaces.find((s) => s.slug === hoveredId);
      if (surface) {
        return {
          group: group.name,
          surface: surface.label,
          slug: surface.slug,
        };
      }
    }
    return null;
  });

  const resolved = $derived.by(() => {
    if (!hoveredId || !configState.solved) return null;
    const bg = configState.solved.backgrounds.get(hoveredId);
    return bg ? bg[themeState.mode] : null;
  });
</script>

{#if trace}
  <div class="context-trace surface-card bordered shadow-lg font-mono">
    <div class="path text-subtle">
      <span class="segment">System</span>
      <span class="separator">/</span>
      <span class="segment">{trace.group}</span>
      <span class="separator">/</span>
      <span class="segment highlight text-strong">{trace.surface}</span>
    </div>
    {#if resolved}
      <div class="metrics text-subtle">
        L: {Math.round(resolved.l * 100)}% C: {resolved.c.toFixed(3)} H: {Math.round(
          resolved.h,
        )}
      </div>
    {/if}
  </div>
{/if}

<style>
  .context-trace {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    /* background: var(--surface-card); */
    /* border: 1px solid var(--surface-bordered); */
    padding: 0.5rem 1rem;
    border-radius: 99px;
    /* box-shadow: var(--shadow-lg); */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    pointer-events: none;
    z-index: 100;
    /* font-family: var(--font-mono); */
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .path {
    display: flex;
    gap: 0.5rem;
  }

  .highlight {
    font-weight: 600;
  }

  .metrics {
    font-size: 0.7rem;
    opacity: 0.8;
  }
</style>
