<script lang="ts">
  type Mode = "light" | "dark";

  function getSurfaces(mode: Mode) {
    const isLight = mode === "light";
    return isLight
      ? [
          {
            name: "Page",
            className: "surface-page",
            label: "Start",
          },
          {
            name: "Card",
            className: "surface-card",
            label: "Mid",
          },
          {
            name: "Sidebar",
            className: "surface-workspace",
            label: "End",
          },
        ]
      : [
          {
            name: "Sidebar",
            className: "surface-workspace",
            label: "End",
          },
          {
            name: "Card",
            className: "surface-card",
            label: "Mid",
          },
          {
            name: "Page",
            className: "surface-page",
            label: "Start",
          },
        ];
  }
</script>

{#snippet rangeCard(title: string, description: string, mode: Mode)}
  {@const isLight = mode === "light"}
  {@const surfaces = getSurfaces(mode)}
  <div
    class="docs-card"
    style:color-scheme={mode}
    style:border="1px solid var(--border-subtle-token)"
    style:border-radius="8px"
    style:overflow="hidden"
    style:background="var(--surface-workspace)"
    style:box-shadow="var(--shadow-sm)"
  >
    <div
      style:padding="1rem"
      style:border-bottom="1px solid var(--border-subtle-token)"
    >
      <strong
        style:display="block"
        style:margin-bottom="0.5rem"
        style:color="var(--text-token)"
      >
        {title}
      </strong>
      <p
        style:margin="0"
        style:font-size="0.9em"
        style:color="var(--text-subtle-token)"
        style:line-height="1.4"
      >
        {description}
      </p>
    </div>

    <div
      class="surface-page"
      style:position="relative"
      style:height="220px"
      style:background="var(--surface-token)"
      style:color="var(--text-high-token)"
      style:padding="2rem"
    >
      <!-- Range Indicator Line -->
      <div
        style:position="absolute"
        style:left="1.5rem"
        style:top="2.5rem"
        style:bottom="2.5rem"
        style:width="4px"
        style:background="var(--border-dec-token)"
        style:border-radius="2px"
      ></div>

      <!-- Anchors Labels -->
      <div
        style:position="absolute"
        style:left="2.5rem"
        style:top="2rem"
        style:font-size="0.75em"
        style:font-weight="bold"
        style:color="var(--text-subtle-token)"
        style:font-family="var(--sl-font-mono)"
      >
        {isLight ? "Start" : "End"}
      </div>
      <div
        style:position="absolute"
        style:left="2.5rem"
        style:bottom="2rem"
        style:font-size="0.75em"
        style:font-weight="bold"
        style:color="var(--text-subtle-token)"
        style:font-family="var(--sl-font-mono)"
      >
        {isLight ? "End" : "Start"}
      </div>

      <!-- Stack Visualization -->
      <div
        style:margin-left="5rem"
        style:display="flex"
        style:flex-direction="column"
        style:height="100%"
        style:justify-content="space-between"
        style:gap="0.5rem"
      >
        {#each surfaces as s}
          <div
            class={s.className}
            style:background="var(--surface-token)"
            style:border="1px solid var(--border-dec-token)"
            style:border-radius="6px"
            style:padding="0 1rem"
            style:color="var(--text-high-token)"
            style:font-size="0.85em"
            style:font-weight="500"
            style:box-shadow="var(--shadow-sm)"
            style:display="flex"
            style:justify-content="space-between"
            style:align-items="center"
            style:flex="1"
          >
            <span>{s.name}</span>
            <span
              style:opacity="0.5"
              style:font-size="0.9em"
              style:font-family="var(--sl-font-mono)"
            >
              <!-- We don't have the exact L value available in CSS var -->
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/snippet}

<div
  class="docs-grid docs-mb-4"
  style:display="grid"
  style:grid-template-columns="repeat(auto-fit, minmax(280px, 1fr))"
  style:gap="1.5rem"
  style:margin-top="1.5rem"
>
  {@render rangeCard(
    "Light Mode (Dimming)",
    "Page starts bright. Surfaces get darker to create separation.",
    "light"
  )}
  {@render rangeCard(
    "Dark Mode (Illumination)",
    "Page starts dark. Surfaces get lighter to approach the light source.",
    "dark"
  )}
</div>
