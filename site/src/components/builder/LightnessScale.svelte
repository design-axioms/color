<script lang="ts">
  import { getContext } from 'svelte';
  import type { ConfigState } from '../../lib/state/ConfigState.svelte';

  const configState = getContext<ConfigState>('config');
  let anchors = $derived(configState.config.anchors);
</script>

<div style="margin-top: 2rem;">
  <h4
    class="text-strong"
    style="margin: 0 0 0.5rem 0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;"
  >
    Anchor Visualization
  </h4>

  <div
    style="position: relative; height: 40px; background: linear-gradient(to right, black, white); border-radius: 4px; margin-bottom: 3.5rem; margin-top: 3.5rem;"
  >
    <!-- Page Light Range -->
    {@render Range({
      start: anchors.page.light.start.background,
      end: anchors.page.light.end.background,
      color: "cyan",
      label: "Page (L)",
      top: true
    })}
    <!-- Page Dark Range -->
    {@render Range({
      start: anchors.page.dark.start.background,
      end: anchors.page.dark.end.background,
      color: "blue",
      label: "Page (D)",
      bottom: true
    })}

    <!-- Inverted Light Range -->
    {@render Range({
      start: anchors.inverted.light.start.background,
      end: anchors.inverted.light.end.background,
      color: "orange",
      label: "Inv (L)",
      top: true,
      offset: 20
    })}
    <!-- Inverted Dark Range -->
    {@render Range({
      start: anchors.inverted.dark.start.background,
      end: anchors.inverted.dark.end.background,
      color: "red",
      label: "Inv (D)",
      bottom: true,
      offset: 20
    })}
  </div>
</div>

{#snippet Range({ start, end, color, label, top, bottom, offset = 0 })}
  {#if start !== null && end !== null}
    {@const left = Math.min(start, end) * 100}
    {@const width = Math.abs(end - start) * 100}
    <div
      style:position="absolute"
      style:left="{left}%"
      style:width="{width}%"
      style:height="4px"
      style:background={color}
      style:top={top ? `-${8 + offset}px` : undefined}
      style:bottom={bottom ? `-${8 + offset}px` : undefined}
    >
      <div
        style:position="absolute"
        style:left="50%"
        style:transform="translateX(-50%)"
        style:top={top ? "-16px" : undefined}
        style:bottom={bottom ? "-16px" : undefined}
        style:font-size="0.7rem"
        style:white-space="nowrap"
        style:color="var(--text-subtle-token)"
      >
        {label}
      </div>
      <!-- Connectors -->
      <div
        style:position="absolute"
        style:left="0"
        style:width="1px"
        style:height="{8 + offset}px"
        style:background={color}
        style:top={top ? "100%" : undefined}
        style:bottom={bottom ? "100%" : undefined}
        style:opacity="0.5"
      ></div>
      <div
        style:position="absolute"
        style:right="0"
        style:width="1px"
        style:height="{8 + offset}px"
        style:background={color}
        style:top={top ? "100%" : undefined}
        style:bottom={bottom ? "100%" : undefined}
        style:opacity="0.5"
      ></div>
    </div>
  {/if}
{/snippet}
