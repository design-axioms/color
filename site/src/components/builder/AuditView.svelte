<script lang="ts">
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";
  import { contrastForPair } from "@axiomatic-design/color";
  import { converter } from "culori";
  import type { ColorSpec } from "@axiomatic-design/color/types";

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let solved = $derived(configState.solved);
  let mode = $derived(themeState.mode);

  const toRgb = converter("rgb");

  function isOutOfGamut(color: ColorSpec): boolean {
    const rgb = toRgb({ mode: "oklch", ...color });
    return (
      rgb.r < 0 || rgb.r > 1 || rgb.g < 0 || rgb.g > 1 || rgb.b < 0 || rgb.b > 1
    );
  }

  function getContrast(bgL: number, fgL: number): number {
    return contrastForPair(fgL, bgL);
  }

  function getRating(contrast: number): string {
    const abs = Math.abs(contrast);
    if (abs >= 90) return "AAA"; // Rough mapping
    if (abs >= 75) return "AAA"; // APCA 75 is roughly WCAG 7:1
    if (abs >= 60) return "AA"; // APCA 60 is roughly WCAG 4.5:1
    if (abs >= 45) return "AA Large";
    if (abs >= 30) return "Spot";
    return "Fail";
  }

  function getScoreClass(contrast: number): string {
    const abs = Math.abs(contrast);
    if (abs >= 75) return "score-pass";
    if (abs >= 60) return "score-warn";
    return "score-fail";
  }
</script>

<div class="audit-view">
  {#if solved}
    <section class="audit-section">
      <h3>Contrast Matrix ({mode})</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Surface</th>
              <th>Background</th>
              <th>High Text</th>
              <th>Strong Text</th>
              <th>Baseline Text</th>
              <th>Subtle Text</th>
              <th>Subtlest Text</th>
            </tr>
          </thead>
          <tbody>
            {#each solved.surfaces as surface (surface.slug)}
              {@const bg = solved.backgrounds.get(surface.slug)?.[mode]}
              {@const computed = surface.computed[mode]}
              {#if bg}
                <tr>
                  <td class="surface-name">
                    <div
                      class="swatch"
                      style="background-color: var(--color-{surface.slug}-bg)"
                    ></div>
                    {surface.name}
                  </td>
                  <td class="value-cell">
                    L: {bg.l.toFixed(2)}
                  </td>
                  {#each ["fg-high", "fg-strong", "fg-baseline", "fg-subtle", "fg-subtlest"] as token (token)}
                    {@const fgL = computed[token as keyof typeof computed]}
                    {@const contrast = getContrast(bg.l, fgL)}
                    <td class="score-cell {getScoreClass(contrast)}">
                      <div class="score-value">
                        {Math.round(Math.abs(contrast))}
                      </div>
                      <div class="score-rating">{getRating(contrast)}</div>
                    </td>
                  {/each}
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <section class="audit-section">
      <h3>Gamut Report ({mode})</h3>
      <p class="description">
        Colors that fall outside the sRGB gamut may be clamped on some displays.
      </p>

      <div class="gamut-list">
        {#each solved.surfaces as surface (surface.slug)}
          {@const bg = solved.backgrounds.get(surface.slug)?.[mode]}
          {#if bg && isOutOfGamut(bg)}
            <div class="gamut-item">
              <div
                class="swatch"
                style="background-color: var(--color-{surface.slug}-bg)"
              ></div>
              <div class="gamut-info">
                <span class="gamut-name">{surface.name}</span>
                <span class="gamut-values">
                  L: {bg.l.toFixed(3)}, C: {bg.c.toFixed(3)}, H: {bg.h.toFixed(
                    1,
                  )}
                </span>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .audit-view {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
    overflow-y: auto;
    height: 100%;
  }

  .audit-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--color-fg-strong);
  }

  .description {
    color: var(--color-fg-subtle);
    margin-bottom: 1rem;
  }

  .table-container {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    text-align: left;
    padding: 0.75rem 1rem;
    background: var(--color-surface-200);
    color: var(--color-fg-strong);
    font-weight: 600;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-fg-baseline);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .surface-name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .swatch {
    width: 1rem;
    height: 1rem;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }

  .value-cell {
    font-family: var(--font-mono);
    color: var(--color-fg-subtle);
  }

  .score-cell {
    text-align: center;
  }

  .score-value {
    font-weight: 600;
    font-size: 1rem;
  }

  .score-rating {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .score-pass {
    color: var(--color-success-fg);
    background: var(--color-success-bg);
  }

  .score-warn {
    color: var(--color-warning-fg);
    background: var(--color-warning-bg);
  }

  .score-fail {
    color: var(--color-danger-fg);
    background: var(--color-danger-bg);
  }

  .gamut-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .gamut-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface-100);
  }

  .gamut-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .gamut-name {
    font-weight: 500;
    color: var(--color-fg-strong);
  }

  .gamut-values {
    font-size: 0.75rem;
    font-family: var(--font-mono);
    color: var(--color-fg-subtle);
  }
</style>
