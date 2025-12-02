<script lang="ts">
  import { contrastForPair } from "@axiomatic-design/color/math";
  import type { Theme } from "@axiomatic-design/color/types";

  interface Props {
    slug: string;
    mode: "light" | "dark";
    solved: Theme | null;
    showStatus?: boolean;
  }

  let { slug, mode, solved, showStatus = false }: Props = $props();

  let surface = $derived(solved?.surfaces.find((s) => s.slug === slug));
  let computed = $derived(surface?.computed);

  let bg = $derived(computed ? computed[mode].background : null);
  let polarity = $derived(surface?.polarity);

  // Logic from math.ts textLightness
  let textL = $derived(
    polarity === "page" ? (mode === "light" ? 0 : 1) : mode === "light" ? 1 : 0,
  );

  let contrast = $derived(bg !== null ? contrastForPair(textL, bg) : 0);
  let score = $derived(Math.round(contrast));

  let status = $derived.by(() => {
    if (score < 45) return "Fail";
    if (score < 60) return "Weak";
    return "Pass";
  });

  let statusClass = $derived.by(() => {
    if (score < 45) return "surface-status-error";
    if (score < 60) return "surface-status-warning";
    return "surface-status-success";
  });
</script>

{#if surface && computed}
  <span
    class="contrast-badge {statusClass} font-mono"
    title="APCA Contrast: {score} ({status})"
  >
    <span class="score">Lc {score}</span>
    {#if showStatus}
      <span class="status">({status})</span>
    {/if}
  </span>
{/if}

<style>
  .contrast-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
  }

  .status {
    opacity: 0.8;
    font-size: 0.7rem;
    text-transform: uppercase;
  }
</style>
