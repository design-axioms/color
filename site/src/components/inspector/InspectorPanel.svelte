<script lang="ts">
  let { element, onClose } = $props<{
    element: HTMLElement;
    onClose: () => void;
  }>();

  type TokenGroup = {
    title: string;
    tokens: {
      name: string;
      value: string;
      resolvedColor: string;
      isLightDark: boolean;
      lightValue?: string;
      darkValue?: string;
    }[];
  };

  let groups = $state<TokenGroup[]>([]);
  let dialog: HTMLDialogElement;

  const GROUPS = [
    {
      title: "Surface",
      names: ["--surface-token", "--surface-page-token"],
    },
    {
      title: "Text",
      names: [
        "--text-high-token",
        "--text-strong-token",
        "--text-subtle-token",
        "--text-subtlest-token",
      ],
    },
    {
      title: "Border & UI",
      names: ["--border-subtle-token", "--focus-ring-color"],
    },
  ];

  function resolveTokenColor(el: HTMLElement, tokenName: string): string {
    const temp = document.createElement("div");
    temp.style.color = `var(${tokenName})`;
    temp.style.display = "none";
    el.appendChild(temp);
    const color = getComputedStyle(temp).color;
    el.removeChild(temp);
    return color;
  }

  function parseLightDark(
    value: string,
  ): { light: string; dark: string } | null {
    if (!value.startsWith("light-dark(")) return null;
    // Simple parser for light-dark(light, dark)
    // This assumes the values inside don't contain unescaped commas at the top level
    // Since we control the tokens (oklch), this is a safe assumption for now
    const content = value.slice(11, -1);
    const parts = content.split(/,\s*(?![^()]*\))/); // Split by comma not inside parens
    if (parts.length === 2) {
      return { light: parts[0].trim(), dark: parts[1].trim() };
    }
    return null;
  }

  $effect(() => {
    const computed = getComputedStyle(element);

    groups = GROUPS.map((group) => ({
      title: group.title,
      tokens: group.names.map((name) => {
        const value = computed.getPropertyValue(name).trim() || "(not set)";
        const isLightDark = value.startsWith("light-dark(");
        const resolvedColor = resolveTokenColor(element, name);
        const lightDarkValues = isLightDark ? parseLightDark(value) : null;

        return {
          name,
          value,
          resolvedColor,
          isLightDark,
          lightValue: lightDarkValues?.light,
          darkValue: lightDarkValues?.dark,
        };
      }),
    }));

    dialog.showPopover();
  });
</script>

<dialog
  bind:this={dialog}
  class="inspector-panel surface-card bordered shadow-xl"
  popover="manual"
  onclose={onClose}
>
  <div class="header">
    <h4 class="title text-subtle">Token Inspector</h4>
    <button
      class="close-btn text-subtle"
      onclick={onClose}
      aria-label="Close inspector"
    >
      &times;
    </button>
  </div>

  <div class="tokens-container">
    {#each groups as group (group.title)}
      <div class="group-section">
        <div class="group-title text-subtle">{group.title}</div>
        <div class="tokens-list">
          {#each group.tokens as token (token.name)}
            <div class="token-row">
              <div class="swatch-container">
                {#if token.isLightDark && token.lightValue && token.darkValue}
                  <div
                    class="color-swatch adaptive"
                    style:--light={token.lightValue}
                    style:--dark={token.darkValue}
                    title={`Light: ${token.lightValue}\nDark: ${token.darkValue}`}
                  ></div>
                {:else}
                  <div
                    class="color-swatch"
                    style:background-color={token.resolvedColor}
                  ></div>
                {/if}
              </div>

              <div class="token-info">
                <div class="token-name-row">
                  <span class="token-name text-subtle">{token.name}</span>
                </div>

                {#if !token.isLightDark}
                  <div class="value-row">
                    <span class="resolved-value text-strong"
                      >{token.resolvedColor}</span
                    >
                  </div>
                {/if}

                {#if token.isLightDark && token.lightValue && token.darkValue}
                  <div class="adaptive-values">
                    <div class="value-item">
                      <span class="label text-subtler">L</span>
                      <span class="value text-strong">{token.lightValue}</span>
                    </div>
                    <div class="value-item">
                      <span class="label text-subtler">D</span>
                      <span class="value text-strong">{token.darkValue}</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</dialog>

<style>
  .inspector-panel {
    border: none;
    padding: 0;
    margin: 0;
    color: inherit;

    position: fixed;
    position-anchor: --inspector-anchor;
    top: anchor(bottom);
    left: anchor(center);
    transform: translateX(-50%);
    margin-top: 0.5rem;

    max-height: 60vh;
    width: 500px;

    border-radius: 8px;
    padding: 1rem;
    /* box-shadow: var(--shadow-xl); */
    overflow-y: auto;

    opacity: 0;
    transition:
      opacity 0.2s,
      display 0.2s allow-discrete,
      overlay 0.2s allow-discrete;
  }

  .inspector-panel:popover-open {
    opacity: 1;
  }

  @starting-style {
    .inspector-panel:popover-open {
      opacity: 0;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--computed-border-dec-color);
  }

  .title {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25rem;
  }

  .close-btn:hover {
    color: var(--computed-fg-color);
  }

  .tokens-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .group-title {
    font-size: 0.7rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tokens-list {
    display: flex;
    flex-direction: column;
  }

  .token-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.375rem 0;
    border-bottom: 1px solid var(--computed-border-dec-color);
  }

  .token-row:last-child {
    border-bottom: none;
  }

  .swatch-container {
    flex-shrink: 0;
  }

  .color-swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--computed-border-dec-color);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  .color-swatch.adaptive {
    background: linear-gradient(135deg, var(--light) 50%, var(--dark) 50%);
  }

  .token-info {
    flex: 1;
    min-width: 0;
  }

  .token-name-row {
    display: flex;
    align-items: baseline;
  }

  .value-row {
    margin-top: 0.25rem;
  }

  .token-name {
    font-family: monospace;
    font-size: 0.8rem;
  }

  .resolved-value {
    font-family: monospace;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .adaptive-values {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    row-gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .value-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: monospace;
  }

  .value-item .value {
    font-size: 0.8rem;
  }

  .label {
    font-weight: 700;
    font-size: 0.65rem;
  }
</style>
