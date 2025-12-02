<script lang="ts">
  import { formatHex } from "culori";
  import { getContext } from "svelte";
  import type { ConfigState } from "../../lib/state/ConfigState.svelte";
  import type { ThemeState } from "../../lib/state/ThemeState.svelte";

  const configState = getContext<ConfigState>("config");
  const themeState = getContext<ThemeState>("theme");

  let config = $derived(configState.config);
  let solved = $derived(configState.solved);
  let mode = $derived(themeState.mode);

  function getSurfaceColor(slug: string): string {
    const spec = solved?.backgrounds.get(slug)?.[mode];
    if (!spec) return "transparent";
    return formatHex({ mode: "oklch", ...spec });
  }

  function getTextColor(slug: string): string {
    const spec = solved?.backgrounds.get(slug)?.[mode];
    if (!spec) return "var(--text-high-token)";
    return spec.l > 0.6 ? "#000000" : "#ffffff";
  }
</script>

<div class="graph-container">
  <div class="node root">
    <div class="node-content">
      <strong>Root</strong>
      <span class="badge">{mode}</span>
    </div>

    <div class="children">
      {#each config.groups as group (group.name)}
        <div class="node group">
          <div class="node-content">
            <strong>{group.name}</strong>
          </div>

          <div class="children">
            {#each group.surfaces as surface (surface.slug)}
              {@const bg = getSurfaceColor(surface.slug)}
              {@const fg = getTextColor(surface.slug)}
              <div class="node surface" style="--bg: {bg}; --fg: {fg}">
                <div class="node-content surface-content">
                  <strong>{surface.label}</strong>
                  <code class="slug">{surface.slug}</code>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .graph-container {
    padding: 2rem;
    overflow: auto;
    display: flex;
    justify-content: center;
  }

  .node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .node-content {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-subtle-token);
    border-radius: 8px;
    background: var(--surface-token);
    min-width: 120px;
    text-align: center;
    z-index: 1;
    box-shadow: var(--shadow-sm-token);
  }

  .children {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    position: relative;
    padding-top: 1rem;
  }

  /* Vertical line from parent to children container */
  .children::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    width: 1px;
    height: 1rem;
    background: var(--border-subtle-token);
  }

  /* Horizontal line connecting children */
  .children::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: transparent; /* We need to be smarter about lines */
  }

  .surface-content {
    background: var(--bg);
    color: var(--fg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .slug {
    display: block;
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .badge {
    display: inline-block;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--surface-action);
    color: var(--text-on-action);
    margin-left: 0.5rem;
    text-transform: uppercase;
  }
</style>
