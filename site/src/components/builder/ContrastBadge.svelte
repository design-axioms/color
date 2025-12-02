<script lang="ts">
  import { contrastForPair } from "@axiomatic-design/color/math";
  import type { Theme } from "@axiomatic-design/color/types";

  interface Props {
    slug: string;
    mode: "light" | "dark";
    solved: Theme | null;
  }

  let { slug, mode, solved }: Props = $props();

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

  let color = $derived.by(() => {
    if (score < 45) return "#d32f2f";
    if (score < 60) return "#f57c00";
    return "#388e3c";
  });

  let borderColor = $derived.by(() => {
    if (score < 45) return "#ffcdd2";
    if (score < 60) return "#ffe0b2";
    return "#c8e6c9";
  });
</script>

{#if surface && computed}
  <span
    style:font-size="0.75rem"
    style:padding="0.1rem 0.4rem"
    style:border-radius="4px"
    style:background-color="var(--surface-workspace-token)"
    style:color
    style:border="1px solid {borderColor}"
    style:margin-left="auto"
    style:font-weight="bold"
    title="APCA Contrast: {score}"
  >
    Lc {score}
  </span>
{/if}
