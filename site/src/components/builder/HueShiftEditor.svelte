<script lang="ts">
  import { getKeyColorStats } from "@axiomatic-design/color/solver";
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import HueShiftVisualizer from "../HueShiftVisualizer.svelte";

  const configState = getContext<ConfigState>("config");
  let config = $derived(configState.config);

  let stats = $derived(getKeyColorStats(config.anchors.keyColors));
  let baseHue = $derived(stats.hue ?? 250);
</script>

{#if config.hueShift}
  <HueShiftVisualizer
    bind:curve={config.hueShift.curve}
    bind:maxRotation={config.hueShift.maxRotation}
    bind:baseHue
    onUpdate={() => {
      configState.markAsCustom();
    }}
  />
{/if}
